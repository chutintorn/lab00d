import React from "react";
import { THEME } from "../config/theme";
import { SEAT_W, SEAT_H } from "../config/ui";

const Seat = React.memo(function Seat({ id, bg, selected, disabled, isPrivacy, onClick }) {
  return (
    <button
      aria-label={`Seat ${id}`}
      title={id}
      onClick={onClick}
      disabled={disabled}
      style={{ background: bg, borderColor: isPrivacy ? THEME.privacyRing : THEME.outline }}
      className={[
        `rounded-lg border ${SEAT_W} ${SEAT_H} shrink-0`,
        disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow",
        selected ? "ring-2 ring-lime-500" : "",
        isPrivacy ? "ring-4" : "",
        "transition focus:outline-none focus:ring-2 focus:ring-amber-400",
      ].join(" ")}
    />
  );
});

export default Seat;
