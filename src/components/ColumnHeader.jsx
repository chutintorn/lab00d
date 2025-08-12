import React from "react";

/**
 * Shows column letters above the seat blocks.
 * Adds a left spacer so letters align with the first seat (column A).
 * Also adds an aisle spacer between left/right blocks, and keeps a right spacer
 * so the total width matches rows that show row numbers on both sides.
 */
export default function ColumnHeader({ leftBlock = [], rightBlock = [] }) {
  const cell =
    "inline-flex items-center justify-center w-10 h-6 text-sm font-semibold text-gray-800";

  return (
    <div className="flex items-center gap-3">
      {/* Left spacer: matches SeatRow's left row-number width (w-8) */}
      <div className="w-8" />

      {/* Left block letters */}
      <div className="flex gap-2">
        {leftBlock.map((c) => (
          <div key={`hdr-left-${c}`} className={cell}>
            {c}
          </div>
        ))}
      </div>

      {/* Aisle spacer: matches SeatRow's aisle width */}
      <div className="w-8" />

      {/* Right block letters */}
      <div className="flex gap-2">
        {rightBlock.map((c) => (
          <div key={`hdr-right-${c}`} className={cell}>
            {c}
          </div>
        ))}
      </div>

      {/* Right spacer to balance the right-side row number */}
      <div className="w-8" />
    </div>
  );
}
