import React, { useCallback } from "react";
import ColumnHeader from "./ColumnHeader";
import SeatRow from "./SeatRow";
import { seatId, seatTypeForSeat } from "../utils/seatHelpers";
import { THEME } from "../config/theme";
import { ZONE_PRICE_THB, MARKUP_PER_ZONE_THB } from "../utils/pricingConstants";

export default function SeatMap({
  rows,
  leftBlock,
  rightBlock,
  zones,
  bookedSet,
  blockedSet,
  selectedSeat,
  privacyBySeat,
  onToggleSeat,
  containerClassName,
  highlightSeat,
  showPrices = false,

  // NEW: needed so we can phrase tooltips like "your privacy seat"
  selectedPassengerId = null,
}) {
  const resolver = useCallback(
    (col, row) => {
      const id = seatId(col, row);
      const isBooked = bookedSet.has(id);
      const isBlocked = blockedSet.has(id);
      const isSelected = selectedSeat === id;

      const zoneType = seatTypeForSeat(row, col, zones) || "happy";
      const baseTHB = ZONE_PRICE_THB[zoneType] ?? 0;

      const privacyOwner = privacyBySeat[id] || null;
      const isPrivacy = !!privacyOwner && !isBooked;

      // price used for display (when showPrices is on)
      const priceTHB = isPrivacy && privacyOwner !== selectedPassengerId
        ? baseTHB + (MARKUP_PER_ZONE_THB[zoneType] ?? 0) // others pay base + fixed markup
        : baseTHB; // free seat or your own privacy seat => base

      // subtle tooltip text (no color changes per your request)
      let title = `Seat ${id}`;
      if (showPrices) {
        const m = MARKUP_PER_ZONE_THB[zoneType] ?? 0;
        if (isPrivacy && privacyOwner !== selectedPassengerId) {
          title += ` – ${priceTHB.toLocaleString("th-TH")} THB (base ${baseTHB.toLocaleString("th-TH")} + markup ${m})`;
        } else {
          title += ` – ${baseTHB.toLocaleString("th-TH")} THB`;
        }
      }
      if (isPrivacy) {
        title += privacyOwner === selectedPassengerId
          ? " – your privacy seat"
          : " – privacy seat held by another passenger";
      }

      const isHighlighted = highlightSeat === id;

      const bg = isBooked
        ? THEME.booked
        : isBlocked
        ? THEME.unavailable
        : isSelected
        ? THEME.selected
        : THEME[zoneType];

      return {
        id,
        bg,
        selected: isSelected,
        highlighted: isHighlighted,
        disabled: isBlocked,
        isPrivacy,
        onClick: () => !isBlocked && onToggleSeat(id),

        // extra fields used by SeatRow
        priceTHB,
        showPrices,
        zoneType,
        title, // SeatRow will use this for the button tooltip
      };
    },
    [
      bookedSet,
      blockedSet,
      selectedSeat,
      onToggleSeat,
      zones,
      privacyBySeat,
      highlightSeat,
      showPrices,
      selectedPassengerId,
    ]
  );

  return (
    <div
      className={`bg-white border rounded-2xl p-3 sm:p-4 overflow-auto ${containerClassName ?? "h-full"}`}
      style={{ borderColor: THEME.outline }}
    >
      <ColumnHeader leftBlock={leftBlock} rightBlock={rightBlock} />
      <div className="mt-1">
        {Array.from({ length: rows }).map((_, i) => (
          <SeatRow
            key={`row-${i + 1}`}
            row={i + 1}
            leftBlock={leftBlock}
            rightBlock={rightBlock}
            resolver={resolver}
            showPrices={showPrices}
          />
        ))}
      </div>
    </div>
  );
}
