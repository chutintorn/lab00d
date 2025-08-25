// src/components/FareSummary.jsx
import React from "react";
import { THEME } from "../config/theme";
import { CURRENCY } from "../utils/pricingConstants";

export default function FareSummary({
  t,
  // current props you already use:
  basePriceTHB = 0,
  privacyCount = 0,
  unitPrivacyFeeTHB = 0,
  // optional alias used in some pages (kept for compatibility):
  baseSeatTHB,
}) {
  const L = {
    title: t?.fare?.title ?? "Fare summary",
    base: t?.fare?.base ?? "Base seat",
    privacy: t?.fare?.privacy ?? "Privacy seats",
    total: t?.fare?.total ?? "Total",
  };

  // prefer explicitly provided basePriceTHB, fall back to baseSeatTHB
  const base = Number.isFinite(Number(basePriceTHB))
    ? Number(basePriceTHB)
    : Number(baseSeatTHB) || 0;

  const count = Number(privacyCount) || 0;
  const unit = Number(unitPrivacyFeeTHB) || 0;

  const privacyTotal = count * unit;
  const total = base + privacyTotal;

  const fmt = (n) => (Number(n) || 0).toLocaleString("th-TH");

  return (
    <div
      className="mt-3 border rounded-xl p-3 bg-white"
      style={{ borderColor: THEME.outline }}
    >
      <div className="font-semibold mb-2">{L.title}</div>

      {/* Base seat */}
      <div className="text-sm flex items-center justify-between">
        <span>{L.base}</span>
        <span className="font-medium">
          {base > 0 ? `${fmt(base)} ${CURRENCY}` : "—"}
        </span>
      </div>

      {/* Privacy seats */}
      <div className="text-sm flex items-center justify-between mt-1">
        <span>
          {L.privacy}
          {unit > 0 && count > 0
            ? ` (${count} × ${fmt(unit)} ${CURRENCY})`
            : ""}
        </span>
        <span className="font-medium">
          {unit > 0 && count > 0 ? `${fmt(privacyTotal)} ${CURRENCY}` : "—"}
        </span>
      </div>

      {/* Total */}
      <div
        className="text-sm flex items-center justify-between mt-2 pt-2 border-t"
        style={{ borderColor: THEME.outline }}
      >
        <span className="font-semibold">{L.total}</span>
        <span className="font-bold">
          {total > 0 ? `${fmt(total)} ${CURRENCY}` : "—"}
        </span>
      </div>
    </div>
  );
}
