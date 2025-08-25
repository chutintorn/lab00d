export const aircraftConfig = {
  rows: 33,
  leftBlock: ["A", "B", "C"],
  rightBlock: ["H", "J", "K"],
  zones: [
    { type: "frontPremium", from: 1, to: 1 },           // Row 1 all seats
    { type: "premium", from: 2, to: 5 },                // Rows 2–5 default Premium
    { type: "happy", from: 6, to: 33 },                 // Rows 6–33 Happy
    { type: "frontPremium", seats: ["2H", "2J", "2K"] } // 👈 Explicit override
  ],
};
