import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import express, { NextFunction } from 'express';
import cors from 'cors';
import insightsRouter from './routes/insights';
import translationRouter from './routes/translation';
import marketRouter from './routes/market';
import chatRouter from './routes/chat';
import leaderSuggestionsRouter from './routes/leaderSuggestions';
import topLeadersRouter from './routes/top-leaders';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routes
app.use('/api/ai', insightsRouter);
app.use('/api/translation', translationRouter);
app.use('/api/market', marketRouter);
app.use('/api/', chatRouter);
app.use('/api/leader-suggestions', leaderSuggestionsRouter);
app.use('/api/top-leaders', topLeadersRouter);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

// Start server
app.listen(port, () => {
  console.log(`LLM Server running on port ${port}`);
  console.log(`- LLM API: http://localhost:${port}/api/ai`);
  console.log(`- Market API: http://localhost:${port}/api/market`);
});
