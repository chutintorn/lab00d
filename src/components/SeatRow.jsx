import React from "react";
import Seat from "./Seat";
import { SEAT_GAP, AISLE_W, ROWNUM_W } from "../config/ui";

const SeatRow = React.memo(function SeatRow({ row, leftBlock, rightBlock, resolver }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${ROWNUM_W} h-[44px] sm:h-[52px] flex items-center justify-center text-gray-500 text-xs sm:text-sm`}>{row}</div>
      <div className={`flex flex-1 justify-center ${SEAT_GAP}`}>
        {leftBlock.map((col) => {
          const s = resolver(col, row);
          return <Seat key={s.id} {...s} />;
        })}
      </div>
      <div className={`${AISLE_W} flex flex-col items-center`}>{row === 1 && <div className="text-xl sm:text-2xl leading-none text-orange-500">«</div>}</div>
      <div className={`flex flex-1 justify-center ${SEAT_GAP}`}>
        {rightBlock.map((col) => {
          const s = resolver(col, row);
          return <Seat key={s.id} {...s} />;
        })}
      </div>
      <div className={`${ROWNUM_W} h-[44px] sm:h-[52px] flex items-center justify-center text-gray-500 text-xs sm:text-sm`}>{row}</div>
    </div>
  );
});

export default SeatRow;
