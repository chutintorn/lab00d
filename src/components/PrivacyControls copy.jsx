// src/components/PrivacyControls.jsx
import React, { useMemo } from "react";
import { THEME } from "../config/theme";

export default function PrivacyControls({
  t,
  currentSeat,
  eligiblePrivacySeats,
  privacyBySeat,
  selectedPassengerId,
  privacyCost,
  unitPrivacyFeeTHB, // NEW: show correct per-zone fee
  togglePrivacySeat,
  clearPrivacyForCurrent,
  onConfirmPrivacy,
  savedFlag,
}) {
  const countSelected = useMemo(
    () => Object.values(privacyBySeat).filter((pid) => pid === selectedPassengerId).length,
    [privacyBySeat, selectedPassengerId]
  );

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
                  className={`inline-flex items-center gap-2 border rounded-md px-2 py-1 text-sm ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
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
            <div className="space-x-2">
              <span>Unit privacy fee:</span>
              <span className="font-semibold">
                {Number(unitPrivacyFeeTHB || 0).toLocaleString()} THB
              </span>
              <span className="text-gray-500">× {countSelected}</span>
              <span>=</span>
              <span className="font-semibold">
                {Number(privacyCost || 0).toLocaleString()} THB
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearPrivacyForCurrent}
                className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
                style={{ borderColor: THEME.outline }}
              >
                {t.privacy.clear}
              </button>
              <button
                onClick={onConfirmPrivacy}
                className="px-3 py-1 rounded-md border bg-emerald-500 text-white hover:opacity-90"
                style={{ borderColor: THEME.outline }}
              >
                {t.privacy.confirm}
              </button>
              {savedFlag && (
                <span className="text-xs text-emerald-600 font-semibold">
                  {t.savedTick}
                </span>
              )}
            </div>
          </div>

          {/* Optional: short note about mark-up behavior */}
          <div className="text-xs text-gray-500">
            Seats you mark as privacy show a higher price to other passengers (fixed mark-up per zone).
            If you remove privacy, price goes back to base immediately.
          </div>
        </div>
      )}
    </div>
  );
}
