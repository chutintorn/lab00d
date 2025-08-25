// src/components/RefundNote.jsx
import React from "react";

/**
 * Small, dismissible notice showing a refund breakdown when a privacy seat is sold.
 *
 * Props:
 * - event: {
 *     ownerId: string|number,
 *     ownerName: string,
 *     seatId: string,           // e.g., "1B"
 *     zone: "frontPremium"|"premium"|"happy",
 *     refundTHB: number,        // total refund amount
 *     base: number,             // base seat price for the zone
 *     topup: number,            // computed top-up (base * 20%)
 *     sharePct: number,         // 0..1 (e.g., 0.5, 1.0)
 *     ts: number,               // timestamp (ms)
 *   }
 * - onClose: () => void
 */
export default function RefundNote({ event, onClose }) {
  if (!event) return null;

  const { ownerName, seatId, zone, refundTHB, base, topup, sharePct } = event;

  return (
    <div className="mt-3 p-3 rounded-lg border bg-amber-50 text-amber-900">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <div className="font-semibold">Refund issued</div>
          <div className="mt-0.5">
            <span className="font-medium">{ownerName}</span> received{" "}
            <span className="font-semibold">
              {Number(refundTHB).toLocaleString("th-TH")} THB
            </span>{" "}
            for privacy seat <span className="font-mono">{seatId}</span> ({zone}).
          </div>
          <div className="text-xs mt-1 opacity-80">
            Breakdown: privacy fee + share of top-up = {base ? `${base} THB` : "—"} + (
            {(sharePct * 100).toFixed(0)}% × {Number(topup).toLocaleString("th-TH")} THB)
          </div>
        </div>

        <button
          className="text-xs px-2 py-1 rounded border hover:bg-white"
          onClick={onClose}
          aria-label="Dismiss refund notice"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
