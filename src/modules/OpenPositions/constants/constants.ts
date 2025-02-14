export const tradeTypes = {
  Options: "Options",
  Multipliers: "Multipliers",
  Accumulators: "Accumulators",
} as const;

export type TradeType = (typeof tradeTypes)[keyof typeof tradeTypes];

export const positionsTableColumns = {
  [tradeTypes.Options]: [
    "Type",
    "Ref. ID",
    "Currency",
    "Stake",
    "Potential payout",
    "Total profit/loss",
    "Contract value",
    "Remaining time",
    "Action",
  ],
  [tradeTypes.Multipliers]: [
    "Type",
    "Multiplier",
    "Currency",
    "Contract cost",
    "Deal cancel. fee",
    "Stake",
    "Take profit/Stop loss",
    "Contract value",
    "Total profit/loss",
    "Action",
  ],
  [tradeTypes.Accumulators]: [
    "Type",
    "Growth rate",
    "Currency",
    "Stake",
    "Take profit",
    "Contract value",
    "Total profit/loss",
    "Action",
  ],
};
