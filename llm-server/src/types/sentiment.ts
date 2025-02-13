export type PostSentiment =
    // Suspicious
    | "pump_and_dump"
    | "spam"
    | "misleading"
    | "high_risk"
    // Legitimate
    | "conservative"
    | "consistent"
    | "verified_strategy"
    | "risk_managed"
    // Neutral
    | "educational"
    | "analysis"
    | "discussion"
    | "update";
