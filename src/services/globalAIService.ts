import { GlobalAIResponse } from '@/types/ai.types';

class GlobalAIService {
  private static instance: GlobalAIService;
  private readonly baseUrl = '/api/global-ai';

  private constructor() {}

  static getInstance(): GlobalAIService {
    if (!GlobalAIService.instance) {
      GlobalAIService.instance = new GlobalAIService();
    }
    return GlobalAIService.instance;
  }

  async sendQuery(query: string): Promise<GlobalAIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      return response.json();
    } catch (error) {
      console.error('GlobalAI Error:', error);
      throw error;
    }
  }
}

export const globalAIService = GlobalAIService.getInstance();
