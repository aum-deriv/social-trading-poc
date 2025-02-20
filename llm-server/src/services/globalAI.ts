import Anthropic from '@anthropic-ai/sdk';
import { QueryType, GlobalAIResponse, FunctionCallResult } from '../types/globalAI.types';
import { queryFunctions, TrendingAsset } from './globalAI/queryFunctions';
import { User, TradingStrategy } from '../types';
import { DataService } from './data';

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

  async processQuery(query: string, userId?: string): Promise<GlobalAIResponse> {
    // Step 1: Determine query type
    const queryType = await this.determineQueryType(query);

    // Handle invalid queries (not related to social trading)
    if (queryType === 'invalid') {
      return {
        type: 'product_info',
        answer:
          'I apologize, but I can only help with questions related to social trading and copy trading features. Please ask me about traders, strategies, copy trading, or platform features.',
        navigation: {
          steps: [],
          relevantScreens: [],
          features: [],
        },
      };
    }

    if (queryType === 'self_query') {
      if (!userId) {
        return {
          type: 'product_info',
          answer: 'Please log in to view your information.',
          navigation: {
            steps: ['Go to Login page', 'Enter your credentials'],
            relevantScreens: ['login'],
            features: ['User Authentication'],
          },
        };
      }

      // Handle self queries
      const response = await this.handleSelfQuestion(query, userId);
      return {
        type: queryType,
        answer: response.answer,
        data: response.data,
      };
    } else if (queryType === 'data_query') {
      // Step 2: Get function call details
      const functionCall = await this.determineQueryFunction(query);

      // Handle invalid queries about unavailable data
      if (functionCall === 'invalid') {
        return {
          type: 'product_info',
          answer:
            'I apologize, but I cannot answer questions about personal information or data that is not available in our system. I can only provide information about trading performance, statistics, and platform features.',
          navigation: {
            steps: [],
            relevantScreens: [],
            features: [],
          },
        };
      }

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
      Analyze this query and determine its type:
      1. self_query - About the current user (e.g., "Who am I?", "Show my stats", "What's my performance?", "My trading preferences")
      2. data_query - Needs data analysis (e.g., "Who are the best performers?", "Show me profitable traders", "List top strategies")
      3. product_info - About features/navigation (e.g., "How do I copy a trader?", "Where can I find my balance?")
      4. invalid - Not related to social trading or platform features

      Query: "${query}"
      Return just one word: "self_query", "data_query", "product_info", or "invalid"
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = response.content[0].text.trim().toLowerCase() as QueryType;
    return result;
  }

  private async determineQueryFunction(query: string): Promise<FunctionCallResult | 'invalid'> {
    const prompt = `
      You are a JSON generator. 
      
      First, check if this query is:
      1. About the current user (e.g., "Who am I?", "Show my stats", "What's my performance?")
      2. Related to social trading, copy trading, traders, strategies, or platform features
      If neither, respond with: "invalid"

      Important: We only have access to these data fields for leaders:
      - performance (winRate, totalPnL, monthlyReturn)
      - tradeCount
      - copierCount
      - activeStrategies
      - status (active/inactive)
      
      DO NOT process queries about unavailable data like:
      - age, birth date
      - personal information
      - location
      - education
      - experience years
      - account creation date

      If the query asks for unavailable data, respond with: "invalid"

      If the query is valid, analyze it and determine which function to call.
      
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

      For valid queries, respond with ONLY a JSON object in this exact format:
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
      // Check for "invalid" response first
      if (response.content[0].text.trim().toLowerCase() === 'invalid') {
        return 'invalid';
      }

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
      return 'invalid';
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
      You are a helpful trading assistant. 
      
      First, verify if this query is related to social trading, copy trading, traders, strategies, or platform features.
      If not, respond with: "I apologize, but I can only help with questions related to social trading and copy trading features. Please ask me about traders, strategies, copy trading, or platform features."

      Important Rules:
      1. ONLY use information present in the provided data
      2. DO NOT make assumptions about missing data
      3. DO NOT mention specific names unless they are in the data
      4. DO NOT reference dates unless they are in the data
      5. If asked about unavailable information, respond with: "I apologize, but I cannot answer questions about personal information or data that is not available in our system. I can only provide information about trading performance, statistics, and platform features."

      If the query is valid, generate a response using the provided data:
      Query: "${query}"
      Data: ${JSON.stringify(data)}

      Response Instructions:
      1. First, verify if the data contains information relevant to the query:
         - Check if the data fields match what the query is asking for
         - Ensure the data type (leader/strategy/market) matches the query intent
         - If data is not relevant, respond with the unavailable information message
      2. For valid data matches:
         - Focus on the most relevant insights
         - Include specific numbers and statistics
         - Keep the response under 3 sentences
      3. Format and Style:
         - Be clear and direct
         - Use natural, conversational language
         - Avoid technical jargon unless necessary
      4. Error Handling:
         - If you're not sure about something, be honest and apologize
         - If data seems incomplete, mention limitations

      Return only the response text, no additional formatting or explanation.
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text;
  }

  private async handleSelfQuestion(
    query: string,
    userId: string
  ): Promise<{ answer: string; data: GlobalAIResponse['data'] }> {
    const userData = await new DataService().getUser(userId);
    if (!userData) {
      throw new Error('User not found');
    }

    const prompt = `
      You are analyzing a user's profile and answering their question.
      Query: "${query}"
      User Data: ${JSON.stringify(userData)}

      Important Rules:
      1. Be personal and direct
      2. Focus on relevant stats for the query
      3. Include specific numbers when available
      4. Keep it under 3 sentences
      5. Add a relevant tip or suggestion
      6. For performance queries, compare to platform averages
      7. For risk queries, consider their preferences
      8. For strategy queries, look at their active strategies
      9. Error Handling:
         - If you're not sure about something, be honest and apologize
         - If data seems incomplete, mention limitations

      Return ONLY a JSON object in this format:
      {
        "answer": "Your personalized response here",
        "data": {
          "items": [{
            "type": "user",
            "aiScore": 85,
            "analysis": {
              "strengths": ["2-3 key strengths"],
              "risks": ["2-3 potential risks"],
              "recommendation": "personalized recommendation"
            },
            "data": {
              "id": "user-id",
              "userType": "leader/copier",
              "performance": {
                "winRate": 0.75,
                "totalPnL": 5000,
                "monthlyReturn": 15
              }
            }
          }],
          "summary": {
            "total": 1,
            "analysis": {
              "trends": ["key trend about the user"],
              "insights": ["important insight about their trading"]
            }
          }
        }
      }
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = JSON.parse(response.content[0].text);
    return {
      answer: result.answer,
      data: {
        items: [
          {
            type: 'user',
            aiScore: this.calculateAIScore(userData, result.data.items[0].analysis),
            analysis: result.data.items[0].analysis,
            data: userData,
            id: userData.id,
          },
        ],
        summary: result.data.summary,
      },
    };
  }

  private async handleProductQuery(query: string): Promise<{
    answer: string;
    navigation: GlobalAIResponse['navigation'];
  }> {
    const productInfo = {
      features: [
        {
          name: 'Copy Trading',
          description: 'Automatically copy trades from successful traders in real-time',
        },
        {
          name: 'AI Insights',
          description: 'Get AI-powered analysis of trading strategies and market trends',
        },
        {
          name: 'Social Feed',
          description: 'Follow and interact with other traders, share strategies and insights',
        },
        {
          name: 'Risk Management',
          description: 'Advanced tools to manage your trading risk and exposure',
        },
      ],
      screens: {
        welcome: {
          name: 'Welcome/Initial Setup',
          features: [
            'Default Copier status for new users',
            'Interest Assessment for personalized AI recommendations',
            'Initial risk management parameters setup',
            'Get Started onboarding',
          ],
        },
        copier: {
          home: {
            name: 'Home Screen',
            features: [
              'Posts and updates feed from followed traders',
              'Create Post functionality',
              'Comment and like on posts',
              'AI post summarization',
            ],
          },
          discover: {
            name: 'Discover Screen',
            features: [
              'Top Leaders leaderboard with filtering',
              'Follow Leaders feature',
              'Top Strategies list',
              'AI-recommended Strategies',
              'Autocopy Strategy feature',
              'Trending assets list',
            ],
          },
          reports: {
            name: 'Reports Screen',
            features: [
              'Open positions list by Leader',
              'Trade details view',
              'Emergency Stop functionality',
            ],
          },
          profile: {
            name: 'Profile Screen',
            features: [
              'Profile management',
              'Balance display',
              'Follow/Unfollow functionality',
              'Leader upgrade option',
              'Follower statistics',
              'Risk management settings',
              'Copied Strategies list',
            ],
          },
        },
        leader: {
          home: {
            name: 'Home Screen',
            features: ['Social feed access', 'Post creation and management', 'Engagement features'],
          },
          discover: {
            name: 'Discover Screen',
            features: ['Market exploration', 'Trending assets view', 'Strategy discovery'],
          },
          reports: {
            name: 'Reports Screen',
            features: [
              'Personal open trades list',
              'Trade management',
              'Historical statements',
              'Copier statistics overview',
            ],
          },
          profile: {
            name: 'Profile Screen',
            features: [
              'Professional profile management',
              'Performance statistics',
              'Strategy creation and management',
              'Copier tracking',
              'Follower management',
            ],
          },
        },
      },
      support: {
        email: 'support@championtrader.com',
        hours: '24/7',
        response_time: 'Within 24 hours',
      },
    };

    const prompt = `
      You are a JSON generator. 
      
      First, verify if this query is related to social trading, copy trading, traders, strategies, or platform features.
      If not, respond with this exact JSON:

      Important: Only answer questions about:
      1. Platform features and navigation
      2. Trading functionality
      3. Available data and statistics
      4. System capabilities

      DO NOT answer questions about:
      1. Personal information
      2. Historical data not in the system
      3. User demographics
      4. Account creation dates

      If the query asks for unavailable information, respond with this exact JSON:
      {
        "answer": "I apologize, but I can only help with questions related to social trading and copy trading features. Please ask me about traders, strategies, copy trading, or platform features.",
        "navigation": {
          "steps": [],
          "relevantScreens": [],
          "features": []
        }
      }

      If the query is valid, use this product information to answer:
      Product Info: ${JSON.stringify(productInfo)}
      Query: "${query}"

      For valid queries, respond with ONLY a JSON object in this exact format:
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
