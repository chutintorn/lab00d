import React from "react";
import { THEME } from "../config/theme";

export default function PrivacyControls({
  t, currentSeat, eligiblePrivacySeats, privacyBySeat, selectedPassengerId,
  privacyCost, togglePrivacySeat, clearPrivacyForCurrent,
}) {
  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: THEME.outline }}>
      <div className="font-semibold mb-2">{t.privacy.title}</div>
      {!currentSeat ? (
        <div className="text-xs text-gray-500">—</div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">{t.privacy.note}</div>
          <div className="flex flex-wrap gap-2">
            {eligiblePrivacySeats.map((sid) => {
              const ownedBy = privacyBySeat[sid];
              const checked = ownedBy === selectedPassengerId;
              const disabled = !!ownedBy && ownedBy !== selectedPassengerId;
              return (
                <label
                  key={sid}
                  className={`inline-flex items-center gap-2 border rounded-md px-2 py-1 text-sm ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ borderColor: THEME.outline }}
                >
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => togglePrivacySeat(sid)}
                  />
                  <span>{sid}</span>
                </label>
              );
            })}
            {eligiblePrivacySeats.length === 0 && (
              <div className="text-xs text-gray-500">No eligible privacy seats</div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              {t.privacy.total}: <span className="font-semibold">{privacyCost.toLocaleString()} THB</span>
            </div>
            <button
              onClick={clearPrivacyForCurrent}
              className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
              style={{ borderColor: THEME.outline }}
            >
              {t.privacy.clear}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
