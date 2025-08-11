import React from "react";
import { SEAT_W, SEAT_GAP, AISLE_W, ROWNUM_W } from "../config/ui";

export default function ColumnHeader({ leftBlock, rightBlock }) {
  return (
    <div className="flex items-center gap-2 px-4 sm:px-8 md:px-10">
      <div className={ROWNUM_W} />
      <div className={`flex flex-1 justify-center ${SEAT_GAP}`}>
        {leftBlock.map((c) => (
          <div key={`lh-${c}`} className={`text-center font-bold text-xs sm:text-sm ${SEAT_W}`}>{c}</div>
        ))}
      </div>
      <div className={AISLE_W} />
      <div className={`flex flex-1 justify-center ${SEAT_GAP}`}>
        {rightBlock.map((c) => (
          <div key={`rh-${c}`} className={`text-center font-bold text-xs sm:text-sm ${SEAT_W}`}>{c}</div>
        ))}
      </div>
      <div className={ROWNUM_W} />
    </div>
  );
}
