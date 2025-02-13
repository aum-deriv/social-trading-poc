import dotenv from "dotenv";
// Load environment variables
dotenv.config();

import express, { NextFunction } from "express";
import cors from "cors";
import insightsRouter from "./routes/insights";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Mount LLM routes
app.use("/api/ai", insightsRouter);

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
            error: "Internal Server Error",
            message:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
);

// Start server
app.listen(port, () => {
    console.log(`LLM Server running on port ${port}`);
    console.log(`- LLM API: http://localhost:${port}/api/ai`);
});
