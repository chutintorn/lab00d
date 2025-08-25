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
 */
export default function CurrentSelectionBar({
  t,
  passengerName = "",
  currentSeat = "",
  zoneType = null,
  basePriceTHB = 0,
  privacyCount = 0,
  unitPrivacyFeeTHB = 0,
}) {
  const L = {
    // use your existing i18n keys where available; fallback to EN strings
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

  const privacyTotal = (Number(privacyCount) || 0) * (Number(unitPrivacyFeeTHB) || 0);
  const totalTHB = (Number(basePriceTHB) || 0) + privacyTotal;

  // line 1
  const line1 = `${L.passenger}: ${passengerName || "—"}`;

  // line 2
  const seatPart = currentSeat
    ? `${currentSeat}${zoneLabel ? ` (${zoneLabel})` : ""}`
    : "—";
  const basePart = `${(basePriceTHB || 0).toLocaleString("th-TH")} ${CURRENCY}`;

  // line 3
  const privacyLeft = `${privacyCount} × ${(unitPrivacyFeeTHB || 0).toLocaleString("th-TH")} ${CURRENCY}`;
  const totalRight = `${totalTHB.toLocaleString("th-TH")} ${CURRENCY}`;

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
