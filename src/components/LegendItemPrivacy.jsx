import React from "react";
import { THEME } from "../config/theme";

export default function LegendItemPrivacy({ label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded border"
        style={{ background: "transparent", borderColor: THEME.privacyRing, borderWidth: 3 }}
      />
      <span className="text-xs text-gray-700">{label}</span>
    </div>
  );
}
