import { Router } from 'express';
import { GlobalAIService } from '../services/globalAI';

const router = Router();
const globalAI = new GlobalAIService();

router.post('/query', async (req, res) => {
  try {
    const { query, userId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await globalAI.processQuery(query, userId);
    res.json(response);
  } catch (error) {
    console.error('[GlobalAI] Error:', error);
    res.status(500).json({
      error: 'Failed to process query',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
