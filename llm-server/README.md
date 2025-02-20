# LLM Server

Node.js server that provides AI-powered insights for social trading posts using Anthropic's Claude API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create .env file:
   ```
   PORT=3001
   ANTHROPIC_API_KEY=your_api_key
   ```

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status
- Response: `{ "status": "ok" }`

### AI Insights
Base path: `/api/ai`

#### Get Feed Insights
- **GET** `/api/ai/feed-insights/:userId`
- Analyzes feed posts for a specific user
- Parameters:
  - `userId`: ID of the user requesting insights
- Response:
  ```json
  {
    "insights": [
      {
        "postId": "string",
        "summary": "Brief overview of the post content",
        "sentiment": "One of: pump_and_dump, spam, misleading, high_risk, conservative, consistent, verified_strategy, risk_managed, educational, analysis, discussion, update",
        "isLegitimate": true,
        "riskLevel": "low/medium/high",
        "recommendation": "Personalized recommendation based on user type and risk level"
      }
    ]
  }
  ```
- Error Responses:
  - 404: User not found
  - 500: Internal server error

## Error Handling
All endpoints include proper error handling with appropriate status codes and error messages. In development mode, detailed error messages are included in the response.

## Features

- Batch processing of posts for efficient analysis
- Robust error handling and fallbacks
- Input sanitization for reliable JSON parsing
- Detailed logging for debugging and monitoring
- Rate limiting and token optimization for API usage
- Support for user context and trading strategies in analysis
