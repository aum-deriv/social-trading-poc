import Anthropic from '@anthropic-ai/sdk';
import { QueryType, GlobalAIResponse, FunctionCallResult } from '../types/globalAI.types';

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
      Analyze this query and determine which function to call and what parameters to use.

      Available functions:
      - getLeadersByPerformance: Find leaders based on trading performance
      - getLeadersByCopiers: Find leaders based on number of copiers
      - getStrategiesByReturn: Find strategies based on return rate
      - getStrategiesByRisk: Find strategies based on risk level
      - getCopiersByProfit: Find copiers based on profit made
      - getMarketsByVolume: Find markets based on trading volume

      Parameters can include:
      - sortOrder: "asc" or "desc"
      - limit: number of results
      - timeframe: "day", "week", "month", "year"
      - filters: {
          minReturn: number,
          maxRisk: number,
          markets: string[]
        }

      Query: ${query}

      Return a JSON object with:
      {
        "function": "function name",
        "parameters": {
          // relevant parameters based on the query
        }
      }
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = JSON.parse(response.content[0].text);
    return result as FunctionCallResult;
  }

  private async executeQueryFunction(
    functionCall: FunctionCallResult
  ): Promise<GlobalAIResponse['data']> {
    // Mock data for now - would be replaced with actual DB queries
    const mockData = {
      items: [
        {
          id: '1',
          type: 'leader' as const,
          aiScore: 85,
          analysis: {
            strengths: ['Consistent performance', 'Good risk management'],
            risks: ['Higher exposure to volatile markets'],
            recommendation: 'Suitable for moderate risk tolerance',
          },
          data: {
            id: '1',
            userType: 'leader' as const,
            username: 'trader1',
            displayName: 'Top Trader',
            profilePicture: 'url',
            followers: [],
            following: [],
            accounts: [],
            performance: {
              winRate: 0.75,
              totalPnL: 50000,
              monthlyReturn: 15,
              totalTrades: 100,
            },
          },
        },
      ],
      summary: {
        total: 1,
        averageScore: 85,
        timeframe: functionCall.parameters.timeframe,
        analysis: {
          trends: ['Increasing focus on risk management'],
          insights: ['Top performers maintain consistent win rates'],
        },
      },
    };

    return mockData;
  }

  private async generateAnswer(query: string, data: GlobalAIResponse['data']): Promise<string> {
    const prompt = `
      Generate a natural, conversational response to this query using the provided data.
      Make it informative but friendly, highlighting key insights and statistics.

      Query: ${query}
      Data: ${JSON.stringify(data)}

      Return a clear, concise response that answers the user's question.
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
      You are a helpful Trade support AI. Use this product information to answer the user's question:

      ${JSON.stringify(productInfo)}

      Query: ${query}

      Return a JSON object with:
      {
        "answer": "Your natural response",
        "navigation": {
          "steps": ["Step 1...", "Step 2..."],
          "relevantScreens": ["screen names"],
          "features": ["relevant features"]
        }
      }
    `;

    const response = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return JSON.parse(response.content[0].text);
  }
}
