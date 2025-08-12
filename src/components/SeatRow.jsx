import React from "react";

/**
 * Renders one seat row.
 * resolver(col, row) returns:
 *   { id, bg, selected, highlighted, disabled, isPrivacy, onClick }
 */
export default function SeatRow({ row, leftBlock = [], rightBlock = [], resolver }) {
  const renderSeat = (col) => {
    const seat = resolver(col, row);
    const { id, bg, selected, highlighted, disabled, isPrivacy, onClick } = seat;

    const base =
      "inline-flex items-center justify-center w-10 h-10 rounded text-sm border transition-colors";
    const style = { backgroundColor: bg };

    // Privacy inset shadow (sky blue)
    const privacyInset = isPrivacy
      ? "shadow-[inset_0_0_0_2px_rgba(56,189,248,0.8)]"
      : "";

    // Selected seat ring (blue)
    const selectedRing = selected ? "ring-2 ring-blue-500 border-blue-500" : "";

    // Highlighted seat ring (yellow)
    const highlightRing =
      !selected && highlighted ? "ring-2 ring-yellow-400 border-yellow-400" : "";

    const disabledClass = disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-95";

    const className = [base, privacyInset, selectedRing, highlightRing, disabledClass]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        key={id}
        type="button"
        className={className}
        style={style}
        onClick={onClick}
        disabled={disabled}
        title={id}
        aria-label={id}
        aria-pressed={selected}
      >
        {/* no label inside seat */}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Row number (left) */}
      <div className="w-8 text-xs text-gray-500 text-right">{row}</div>

      {/* Left seats */}
      <div className="flex gap-2">{leftBlock.map(renderSeat)}</div>

      {/* Aisle */}
      <div className="w-8" />

      {/* Right seats */}
      <div className="flex gap-2">{rightBlock.map(renderSeat)}</div>

      {/* Row number (right) */}
      <div className="w-8 text-xs text-gray-500">{row}</div>
    </div>
  );
}
