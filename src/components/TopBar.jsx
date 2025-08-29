// src/components/TopBar.jsx
import React from "react";
import { THEME } from "../config/theme";

export default function TopBar({ lang, onToggleLang }) {
  // Title per language
  const TITLES = {
    EN: "Standby Privacy Seat Offer",
    TH: "จองโอกาสได้ที่นั่งว่างด้านข้างคุณ",
  };

  // What the button shows (current language)
  const btnLabel = lang === "TH" ? "TH" : "EN";

  return (
    <div
      className="border rounded-xl px-3 py-3 flex flex-wrap items-center gap-3 bg-[#ffc106]"
      style={{ borderColor: THEME.outline }}
    >
      <div className="text-lg font-bold">
        {TITLES[lang] || TITLES.EN}
      </div>

      <div className="ml-auto flex gap-2">
        <button
          onClick={onToggleLang}
          className="px-2 py-1 rounded-md text-md font-bold bg-[#ffd62e]"
          style={{ borderColor: THEME.outline }}
          title={lang === "EN" ? "สลับเป็นภาษาไทย" : "Switch to English"}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
}
