import { SuggestedLeader } from '../types/leader.types';

const LLM_SERVER_URL = import.meta.env.VITE_LLM_SERVER_URL;
if (!LLM_SERVER_URL) {
  throw new Error('VITE_LLM_SERVER_URL environment variable is not set');
}

interface LeaderSuggestionsResponse {
  suggestions: SuggestedLeader[];
  totalResults: number;
}

export async function fetchLeaderSuggestions(userId: string): Promise<LeaderSuggestionsResponse> {
  const response = await fetch(`${LLM_SERVER_URL}/api/leader-suggestions/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leader suggestions');
  }
  return response.json();
}
