import React from "react";
import { THEME } from "../config/theme";

export default function TopBar({ lang, onToggleLang }) {
  return (
    <div className="border rounded-xl px-3 py-3 flex flex-wrap items-center gap-3 bg-[#ffc106]" style={{ borderColor: THEME.outline }}>
      <div className="text-lg font-bold">Seat Selection</div>
      <div className="ml-auto flex gap-2">
        <button
          onClick={onToggleLang}
          className="px-2 py-1 rounded-md  text-md font-bold bg-[#ffd62e]"
          style={{ borderColor: THEME.outline }}
        >
          {lang}
        </button>
      </div>
    </div>
  );
}
