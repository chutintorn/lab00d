import React, { useCallback } from "react";
import ColumnHeader from "./ColumnHeader";
import SeatRow from "./SeatRow";
import { seatId, seatTypeFor } from "../utils/seatHelpers";
import { THEME } from "../config/theme";

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
  containerClassName, // allows parent to control height (e.g., "h-full")
}) {
  const resolver = useCallback(
    (col, row) => {
      const id = seatId(col, row);
      const isBooked = bookedSet.has(id);
      const isBlocked = blockedSet.has(id);
      const isSelected = selectedSeat === id;
      const type = seatTypeFor(row, zones);
      const isPrivacy = !!privacyBySeat[id] && !isBooked;

      const bg = isBooked ? THEME.booked : isBlocked ? THEME.unavailable : isSelected ? THEME.selected : THEME[type];
      return { id, bg, selected: isSelected, disabled: isBlocked, isPrivacy, onClick: () => !isBlocked && onToggleSeat(id) };
    },
    [bookedSet, blockedSet, selectedSeat, onToggleSeat, zones, privacyBySeat]
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
          />
        ))}
      </div>
    </div>
  );
}
