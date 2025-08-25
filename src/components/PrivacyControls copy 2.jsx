import React from "react";
import { THEME } from "../config/theme";

export default function PrivacyControls({
  t,
  currentSeat,
  eligiblePrivacySeats,
  privacyBySeat,
  selectedPassengerId,

  // totals
  privacyCost,

  // NEW: dynamic fee & refund per seat for the current passenger's zone
  unitPrivacyFeeTHB = 0,
  refundPerSeatTHB = 0,

  togglePrivacySeat,
  clearPrivacyForCurrent,
  onConfirmPrivacy, // optional; if you don't persist separately, you can omit
  savedFlag,        // optional
}) {
  const L = {
    title: t?.privacy?.title ?? "Privacy",
    note: t?.privacy?.note ?? "You can hold empty adjacent seats for this passenger.",
    taken: t?.privacy?.taken ?? "This privacy seat is already taken.",
    clear: t?.privacy?.clear ?? "Clear privacy",
    total: t?.privacy?.total ?? "Privacy total",
    feePerSeat: t?.privacy?.feePerSeat ?? "Privacy per seat",
    refundTitle: t?.privacy?.refundTitle ?? "Refund if a privacy seat is sold",
    refundLine: t?.privacy?.refundLine ?? "You paid {fee} THB per seat. If someone purchases that seat, you’ll be refunded {refund} THB per sold seat.",
    confirm: t?.privacy?.confirm ?? "Confirm privacy",
    savedHint: t?.savedHint ?? "Saved locally.",
    savedTick: t?.savedTick ?? "Saved!",
  };

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: THEME.outline }}>
      <div className="font-semibold mb-2">{L.title}</div>
      {!currentSeat ? (
        <div className="text-xs text-gray-500">—</div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-gray-600">{L.note}</div>

          {/* Fee by zone + Refund info */}
          <div className="rounded-lg border p-2 bg-gray-50 text-xs" style={{ borderColor: THEME.outline }}>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{L.feePerSeat}</span>
              <span className="font-semibold">{unitPrivacyFeeTHB.toLocaleString("th-TH")} THB</span>
            </div>
            <div className="mt-1 text-gray-700 font-medium">{L.refundTitle}</div>
            <div className="text-gray-600">
              {L.refundLine
                .replace("{fee}", unitPrivacyFeeTHB.toLocaleString("th-TH"))
                .replace("{refund}", refundPerSeatTHB.toLocaleString("th-TH"))
              }
            </div>
          </div>

          {/* Seat checkboxes */}
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

          {/* Totals + actions */}
          <div className="flex items-center justify-between text-sm">
            <div>
              {L.total}: <span className="font-semibold">{privacyCost.toLocaleString("th-TH")} THB</span>
            </div>
            <div className="flex gap-2">
              {onConfirmPrivacy && (
                <button
                  onClick={onConfirmPrivacy}
                  className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
                  style={{ borderColor: THEME.outline }}
                >
                  {L.confirm}
                </button>
              )}
              <button
                onClick={clearPrivacyForCurrent}
                className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
                style={{ borderColor: THEME.outline }}
              >
                {L.clear}
              </button>
            </div>
          </div>
          {savedFlag && <div className="text-xs text-emerald-600">{L.savedTick}</div>}
        </div>
      )}
    </div>
  );
}
