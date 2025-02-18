import express from 'express';
import { DataService } from '../services/data';
import { LeaderSuggestionsService } from '../services/leaderSuggestions';

const router = express.Router();
const dataService = new DataService();
const leaderSuggestionsService = new LeaderSuggestionsService(dataService);

// GET /api/leader-suggestions/:copierId
router.get('/:copierId', async (req, res) => {
  try {
    const { copierId } = req.params;
    
    const suggestions = await leaderSuggestionsService.findMatchingLeaders(copierId);
    
    res.json({
      suggestions,
      totalResults: suggestions.length
    });
  } catch (error) {
    console.error('Error getting leader suggestions:', error);
    res.status(500).json({
      error: 'Failed to get leader suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
