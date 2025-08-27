// src/components/ShoppingBasket.jsx
import React from "react";
import { THEME } from "../config/theme";
import { CURRENCY } from "../utils/pricingConstants";

/**
 * ShoppingBasket
 *
 * Props (all optional except what's already used):
 * - title: string (default: "Shopping basket")
 * - seatLabel: string (e.g., "1C")
 * - baseSeatPriceTHB: number
 * - privacySeatIds: string[] (e.g., ["1A","1B"])
 * - unitPrivacyFeeTHB: number (per privacy seat)
 * - refundPerSeatTHB: number (optional; shows "Estimated refund")
 * - lang: "EN" | "TH" (default: "EN")
 * - compact: boolean (default: false) → render one-line summary like:
 *     "Privacy seats: 2 (1A, 1B) × 200 THB | Total: 900 THB"
 * - currency: string (default: CURRENCY from pricingConstants)
 */
export default function ShoppingBasket({
  title = "Shopping basket",
  seatLabel,
  baseSeatPriceTHB = 0,
  privacySeatIds = [],
  unitPrivacyFeeTHB = 0,
  refundPerSeatTHB = 0,
  lang = "EN",
  compact = false,
  currency = CURRENCY,
}) {
  const L = labels(lang);

  const fmt = (n) => (Number(n) || 0).toLocaleString("th-TH");
  const count = privacySeatIds.length;
  const unit = Number(unitPrivacyFeeTHB) || 0;
  const base = Number(baseSeatPriceTHB) || 0;
  const privacyTotal = count * unit;
  const estRefundTotal = count * (Number(refundPerSeatTHB) || 0);
  const total = base + privacyTotal;

  // COMPACT ONE-LINER MODE
  if (compact) {
    const seatsList = count ? ` (${privacySeatIds.join(", ")})` : "";
    const privacyLine = count
      ? `${L.privacy}: ${count}${seatsList} × ${fmt(unit)} ${currency}`
      : `${L.privacy}: ${L.none}`;

    return (
      <div
        className="border rounded-2xl p-3 sm:p-4 bg-white"
        style={{ borderColor: THEME.outline }}
      >
        <div className="flex items-center justify-between">
          <div className="font-semibold">{title}</div>
        </div>

        <div className="mt-2 text-[15px] md:text-sm text-blue-800 flex flex-wrap items-center gap-y-1">
          {/* Seat */}
          <span>
            <span className="font-medium">{L.seat}:</span> {seatLabel || "—"}
          </span>

          <span className="mx-2">|</span>

          {/* Privacy one-liner */}
          <span>{privacyLine}</span>

          <span className="mx-2">|</span>

          {/* Total */}
          <span>
            <span className="font-medium">{L.total}:</span> {fmt(total)} {currency}
          </span>
        </div>

        {/* Optional estimated refund hint */}
        {count > 0 && refundPerSeatTHB > 0 && (
          <div className="mt-1 text-xs text-gray-600">
            {L.refundEst}: {count} × {fmt(refundPerSeatTHB)} {currency} ={" "}
            <span className="font-medium">{fmt(estRefundTotal)} {currency}</span>
          </div>
        )}
      </div>
    );
  }

  // STANDARD (DETAILED) MODE
  return (
    <div
      className="border rounded-2xl p-3 sm:p-4 bg-white"
      style={{ borderColor: THEME.outline }}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">{title}</div>
      </div>

      <div className="mt-2 text-sm">
        <div className="flex items-center justify-between">
          <span>{L.seat}</span>
          <span className="font-medium">{seatLabel || "—"}</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span>{L.base}</span>
          <span className="font-medium">
            {fmt(base)} {currency}
          </span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span>
            {L.privacy}
            {count > 0 ? ` (${count} × ${fmt(unit)} ${currency})` : ""}
          </span>
          <span className="font-medium">
            {count > 0 ? `${fmt(privacyTotal)} ${currency}` : "—"}
          </span>
        </div>

        {count > 0 && (
          <div className="mt-1 text-xs">
            <span className="opacity-70">{L.privacyIds}: </span>
            <span className="font-mono">{privacySeatIds.join(", ")}</span>
          </div>
        )}

        {/* Optional estimated refund block */}
        {count > 0 && refundPerSeatTHB > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span>{L.refundEst}</span>
            <span className="font-medium">
              {fmt(estRefundTotal)} {currency}
            </span>
          </div>
        )}

        <div
          className="mt-2 pt-2 border-t flex items-center justify-between"
          style={{ borderColor: THEME.outline }}
        >
          <span className="font-semibold">{L.total}</span>
          <span className="font-semibold">
            {fmt(total)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Localized labels (kept internal so no dependency on your i18n/STR) */
/* ------------------------------------------------------------------ */
function labels(lang = "EN") {
  if (lang === "TH") {
    return {
      seat: "ที่นั่ง",
      base: "ราคาที่นั่งพื้นฐาน",
      privacy: "ที่นั่งความเป็นส่วนตัว",
      privacyIds: "รหัสที่นั่งความเป็นส่วนตัว",
      total: "รวม",
      none: "—",
      refundEst: "ประมาณการเงินคืน",
    };
  }
  return {
    seat: "Seat",
    base: "Base seat price",
    privacy: "Privacy seats",
    privacyIds: "Privacy seat IDs",
    total: "Total",
    none: "—",
    refundEst: "Estimated refund",
  };
}
