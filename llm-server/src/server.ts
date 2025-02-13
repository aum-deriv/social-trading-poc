import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import insightsRouter from "./routes/insights";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", insightsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Error handling middleware
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
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
});
