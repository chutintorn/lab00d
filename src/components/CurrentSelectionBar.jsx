import React, { useMemo } from "react";
import { THEME } from "../config/theme";
import { CURRENCY } from "../utils/pricingConstants";

/**
 * Props
 * - t: i18n strings
 * - passengerName: string
 * - currentSeat: string (e.g., "1B")
 * - zoneType: "frontPremium" | "premium" | "happy" | null
 * - basePriceTHB: number (e.g., 500)
 * - privacyCount: number (e.g., 2)
 * - unitPrivacyFeeTHB: number (e.g., 200)
 * - privacySeatIds?: string[]  // NEW: e.g., ["1A","1B"] to show seat numbers
 */
export default function CurrentSelectionBar({
  t,
  passengerName = "",
  currentSeat = "",
  zoneType = null,
  basePriceTHB = 0,
  privacyCount = 0,
  unitPrivacyFeeTHB = 0,
  privacySeatIds = [], // NEW
}) {
  const L = {
    passenger: "Current passenger",
    selectedSeat: t?.selectedSeat ?? "Selected seat",
    baseSeat: t?.fare?.base ?? "Base seat",
    privacy: t?.fare?.privacy ?? "Privacy seats",
    total: t?.fare?.total ?? "Total",
  };

  // map zoneType -> display label using your legend strings
  const zoneLabel = useMemo(() => {
    const G = t?.legend || {};
    switch (zoneType) {
      case "frontPremium": return G.fp || "Premium Front Row";
      case "premium":      return G.p  || "Premium";
      case "happy":        return G.h  || "Happy";
      default:             return "";
    }
  }, [zoneType, t]);

  const safeCount   = Number.isFinite(Number(privacyCount)) ? Number(privacyCount) : 0;
  const safeUnitFee = Number.isFinite(Number(unitPrivacyFeeTHB)) ? Number(unitPrivacyFeeTHB) : 0;
  const privacyTotal = safeCount * safeUnitFee;
  const totalTHB = (Number(basePriceTHB) || 0) + privacyTotal;

  // line 1
  const line1 = `${L.passenger}: ${passengerName || "—"}`;

  // line 2
  const seatPart = currentSeat
    ? `${currentSeat}${zoneLabel ? ` (${zoneLabel})` : ""}`
    : "—";
  const basePart = `${(basePriceTHB || 0).toLocaleString("th-TH")} ${CURRENCY}`;

  // line 3 — include seat numbers if provided
  const hasSeatIds = Array.isArray(privacySeatIds) && privacySeatIds.length > 0;
  const seatList = hasSeatIds ? ` (${privacySeatIds.join(", ")})` : "";
  const privacyLeft = `${safeCount}${seatList} × ${safeUnitFee.toLocaleString("th-TH")} ${CURRENCY}`;
  const totalRight  = `${totalTHB.toLocaleString("th-TH")} ${CURRENCY}`;

  return (
    <div
      className="w-full rounded-xl px-4 py-3 mb-3 shadow-sm"
      style={{ backgroundColor: "#ebf9ff", border: `1px solid ${THEME.outline}` }}
    >
      {/* line 1 */}
      <div className="text-sm md:text-base font-semibold text-blue-700">
        {line1}
      </div>

      {/* line 2 */}
      <div className="text-[14px] md:text-sm text-blue-800 mt-1 flex flex-wrap items-center gap-y-1">
        <span><span className="font-medium">{L.selectedSeat}:</span> {seatPart}</span>
        <span className="mx-2">|</span>
        <span><span className="font-medium">{L.baseSeat}:</span> {basePart}</span>
      </div>

      {/* line 3 */}
      <div className="text-[14px] md:text-sm text-green-700 mt-1 flex flex-wrap items-center gap-y-1">
        <span>
          <span className="font-medium">{L.privacy}:</span>{" "}
          <span className="font-normal">{privacyLeft}</span>
        </span>
        <span className="mx-2">|</span>
        <span>
          <span className="font-medium">{L.total}:</span>{" "}
          <span className="font-normal">{totalRight}</span>
        </span>
      </div>
    </div>
  );
}
