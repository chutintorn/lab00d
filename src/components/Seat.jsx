import React, { useMemo } from "react";
import { THEME } from "../config/theme";
import { SEAT_W, SEAT_H } from "../config/ui";

const Seat = React.memo(function Seat({
  id,
  bg,
  selected,
  disabled,
  isPrivacy,
  onClick,

  // NEW (optional):
  showPrices = false,  // toggled from ControlsBar → SeatMap → SeatRow → Seat
  priceTHB = 0,        // provided by resolver (from zone)
}) {
  const aria = useMemo(() => {
    let label = `Seat ${id}`;
    if (isPrivacy) label += " (privacy seat reserved)";
    if (selected) label += " selected";
    if (showPrices) label += `, price ${priceTHB} THB`;
    return label;
  }, [id, isPrivacy, selected, showPrices, priceTHB]);

  return (
    <button
      aria-label={aria}
      title={id}
      onClick={onClick}
      disabled={disabled}
      style={{ background: bg, borderColor: isPrivacy ? THEME.privacyRing : THEME.outline }}
      className={[
        `relative rounded-lg border ${SEAT_W} ${SEAT_H} shrink-0`,
        "flex flex-col items-center justify-center", // center ID/price
        disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow",
        selected ? "ring-2 ring-lime-500" : "",
        isPrivacy ? "ring-4" : "",
        "transition focus:outline-none focus:ring-2 focus:ring-amber-400",
      ].join(" ")}
    >
      {/* Seat ID */}
      <span className="text-[11px] font-semibold leading-none">{id}</span>

      {/* Price (shown only when toggled on) */}
      {showPrices && (
        <span className="mt-0.5 text-[10px] leading-none text-gray-700">
          {priceTHB.toLocaleString("th-TH")} THB
        </span>
      )}
    </button>
  );
});

export default Seat;
