import express from 'express';
import { translateText, detectLanguage } from '../services/translation';

const router = express.Router();

router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang = 'EN' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const translatedText = await translateText(text, targetLang);
    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

router.post('/detect-language', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const language = await detectLanguage(text);
    res.json({ language });
  } catch (error) {
    console.error('Error in language detection route:', error);
    res.status(500).json({ error: 'Failed to detect language' });
  }
});

export default router;
