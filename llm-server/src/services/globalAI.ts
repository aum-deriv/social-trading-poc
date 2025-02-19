import Anthropic from '@anthropic-ai/sdk';
import { QueryType, GlobalAIResponse, FunctionCallResult } from '../types/globalAI.types';
import { queryFunctions, TrendingAsset } from './globalAI/queryFunctions';
import { User, TradingStrategy } from '../types';

export class GlobalAIService {
  private anthropic: Anthropic;
  private readonly MODEL = 'claude-3-5-sonnet-20241022';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  async processQuery(query: string): Promise<GlobalAIResponse> {
    // Step 1: Determine query type
    const queryType = await this.determineQueryType(query);

    if (queryType === 'data_query') {
      // Step 2: Get function call details
      const functionCall = await this.determineQueryFunction(query);

      // Step 3: Execute function and get data
      const data = await this.executeQueryFunction(functionCall);

      // Step 4: Generate human-readable answer
      const answer = await this.generateAnswer(query, data);

      return {
        type: queryType,
        answer,
        data,
      };
    } else {
      // Handle product info queries
      const response = await this.handleProductQuery(query);
      return {
        type: 'product_info',
        answer: response.answer,
        navigation: response.navigation,
      };
    }
  }

  private async determineQueryType(query: string): Promise<QueryType> {
    const prompt = `
      Analyze this query and determine if it's:
      1. data_query - Needs data analysis (e.g., "Who are the best performers?", "Show me the most profitable traders", "List top strategies")
      2. product_info - About features/navigation (e.g., "How do I copy a trader?", "Where can I find my balance?", "How to create a strategy?")

      Query: ${query}
      Return just one word: "data_query" or "product_info"
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = response.content[0].text.trim().toLowerCase();
    return result === 'data_query' ? 'data_query' : 'product_info';
  }

  private async determineQueryFunction(query: string): Promise<FunctionCallResult> {
    const prompt = `
      You are a JSON generator. Analyze this query and determine which function to call.
      
      Available functions:
      - getLeadersByPerformance: Find leaders based on trading performance
      - getLeadersByCopiers: Find leaders based on number of copiers
      - getStrategiesByReturn: Find strategies based on return rate
      - getStrategiesByRisk: Find strategies based on risk level
      - getCopiersByProfit: Find copiers based on profit made
      - getMarketsByVolume: Find markets based on trading volume

      Parameters:
      - sortOrder: "asc" or "desc"
      - limit: number of results (e.g., 5, 10)
      - timeframe: "day", "week", "month", "year"
      - filters: {
          minReturn: number,
          maxRisk: "low" | "medium" | "high",
          markets: string[]
        }

      Query: "${query}"

      Respond with ONLY a JSON object in this exact format:
      {
        "function": "one of the function names listed above",
        "parameters": {
          "sortOrder": "asc" or "desc",
          "limit": number,
          "timeframe": "day" or "week" or "month" or "year",
          "filters": {}
        }
      }

      Do not include any explanation or additional text. Return only the JSON object.
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0, // Make responses more deterministic
    });

    try {
      // Extract JSON if it's wrapped in backticks or has additional text
      const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const result = JSON.parse(jsonMatch[0]);

      // Validate the response format
      if (!result.function || !result.parameters) {
        throw new Error('Invalid response format');
      }

      // Ensure function is one of the valid options
      if (!Object.keys(queryFunctions).includes(result.function)) {
        throw new Error(`Invalid function: ${result.function}`);
      }

      return result as FunctionCallResult;
    } catch (error) {
      console.error('[GlobalAI] Error parsing function call:', error);
      // Fallback to a default function
      return {
        function: 'getLeadersByPerformance',
        parameters: {
          sortOrder: 'desc',
          limit: 5,
        },
      };
    }
  }

  private async executeQueryFunction(
    functionCall: FunctionCallResult
  ): Promise<GlobalAIResponse['data']> {
    try {
      // Get the appropriate query function
      const queryFunction = queryFunctions[functionCall.function as keyof typeof queryFunctions];
      if (!queryFunction) {
        throw new Error(`Unknown query function: ${functionCall.function}`);
      }

      // Execute the query function
      const rawData = await queryFunction(functionCall.parameters);

      // Generate AI analysis for each item
      const items = await Promise.all(
        rawData.map(async item => {
          const analysisPrompt = `
            You are a JSON generator. Analyze this ${
              functionCall.function.includes('Leader')
                ? 'leader'
                : functionCall.function.includes('Copier')
                  ? 'copier'
                  : functionCall.function.includes('Market')
                    ? 'market'
                    : 'strategy'
            } data and provide insights.

            Data: ${JSON.stringify(item)}

            Respond with ONLY a JSON object in this exact format:
            {
              "strengths": ["2-3 key strengths based on the data"],
              "risks": ["2-3 potential risks or concerns"],
              "recommendation": "one clear, actionable recommendation"
            }

            Do not include any explanation or additional text. Return only the JSON object.
          `;

          const analysisResponse = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 1024,
            messages: [{ role: 'user', content: analysisPrompt }],
          });

          const analysis = JSON.parse(analysisResponse.content[0].text);

          return {
            id: 'symbol' in item ? item.symbol : item.id,
            type: functionCall.function.includes('Leader')
              ? ('leader' as const)
              : functionCall.function.includes('Copier')
                ? ('copier' as const)
                : functionCall.function.includes('Market')
                  ? ('market' as const)
                  : ('strategy' as const),
            aiScore: this.calculateAIScore(item, analysis),
            analysis,
            data: item,
          };
        })
      );

      // Generate summary analysis
      const summaryPrompt = `
        You are a JSON generator. Analyze this collection of ${
          functionCall.function.includes('Leader')
            ? 'leaders'
            : functionCall.function.includes('Copier')
              ? 'copiers'
              : functionCall.function.includes('Market')
                ? 'markets'
                : 'strategies'
        }.

        Data: ${JSON.stringify(items)}

        Respond with ONLY a JSON object in this exact format:
        {
          "trends": ["2-3 key trends observed in the data"],
          "insights": ["2-3 important insights or patterns"]
        }

        Do not include any explanation or additional text. Return only the JSON object.
      `;

      const summaryResponse = await this.anthropic.messages.create({
        model: this.MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: summaryPrompt }],
      });

      const summaryAnalysis = JSON.parse(summaryResponse.content[0].text);

      return {
        items,
        summary: {
          total: items.length,
          averageScore: items.reduce((sum, item) => sum + item.aiScore, 0) / items.length,
          timeframe: functionCall.parameters.timeframe,
          analysis: summaryAnalysis,
        },
      };
    } catch (error) {
      console.error('[GlobalAI] Error executing query function:', error);
      throw error;
    }
  }

  private calculateAIScore(
    item: User | TradingStrategy | TrendingAsset,
    analysis: { risks: string[]; strengths: string[] }
  ): number {
    // Calculate a score between 0-100 based on various factors
    let score = 50; // Base score

    // Performance factors
    // Handle User
    if ('userType' in item && item.performance) {
      if (item.performance.winRate) score += item.performance.winRate * 20;
      if (item.performance.totalPnL > 0) score += 10;
      if (item.performance.monthlyReturn > 10) score += 10;
    }

    // Handle TradingStrategy
    if ('tradeType' in item && item.performance) {
      if (item.performance.winRate) score += item.performance.winRate * 20;
      if (item.performance.totalReturn > 0) score += 10;
      if (item.performance.averageProfit > 0) score += 10;
    }

    // Handle TrendingAsset
    if ('changePercentage' in item) {
      const absChange = Math.abs(item.changePercentage);
      if (absChange > 5) score += 20;
      if (item.direction === 'up') score += 10;
    }

    // Risk factors
    if (analysis.risks.length < 2) score += 10;
    if (analysis.strengths.length > 2) score += 10;

    // Cap the score between 0 and 100
    return Math.min(Math.max(score, 0), 100);
  }

  private async generateAnswer(query: string, data: GlobalAIResponse['data']): Promise<string> {
    const prompt = `
      You are a helpful trading assistant. Generate a response to this query using the provided data.
      
      Query: "${query}"
      Data: ${JSON.stringify(data)}

      Instructions:
      1. Focus on the most relevant insights from the data
      2. Include specific numbers and statistics when available
      3. Keep the response under 3 sentences
      4. Be clear and direct
      5. Use natural, conversational language
      6. Do not include technical jargon unless necessary

      Return only the response text, no additional formatting or explanation.
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text;
  }

  private async handleProductQuery(query: string): Promise<{
    answer: string;
    navigation: GlobalAIResponse['navigation'];
  }> {
    const productInfo = {
      features: [
        {
          name: 'Copy Trading',
          description: 'Automatically copy trades from successful traders',
        },
        {
          name: 'AI Insights',
          description: 'Get AI-powered analysis of trading strategies',
        },
      ],
      screens: {
        discover: {
          name: 'Discover Screen',
          features: ['Leader search', 'Top Leaders', 'Strategies list'],
        },
        profile: {
          name: 'Profile Screen',
          features: ['Performance stats', 'Copy settings', 'Account management'],
        },
      },
    };

    const prompt = `
      You are a JSON generator. Use this product information to answer the user's question.

      Product Info: ${JSON.stringify(productInfo)}
      Query: "${query}"

      Respond with ONLY a JSON object in this exact format:
      {
        "answer": "A clear, helpful response explaining how to accomplish the user's goal",
        "navigation": {
          "steps": ["2-3 specific steps to accomplish the task"],
          "relevantScreens": ["1-2 relevant screen names from the product info"],
          "features": ["1-2 relevant features from the product info"]
        }
      }

      Do not include any explanation or additional text. Return only the JSON object.
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return JSON.parse(response.content[0].text);
  }
}
