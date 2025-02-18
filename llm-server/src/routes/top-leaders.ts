import { Router } from 'express';
import { getTopLeaders } from '../services/top-leaders';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const leaders = await getTopLeaders();
    res.json(leaders);
  } catch (error) {
    console.error('Error in top leaders route:', error);
    res.status(500).json({ error: 'Failed to fetch top leaders' });
  }
});

export default router;
