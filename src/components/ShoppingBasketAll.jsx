// src/components/ShoppingBasketAll.jsx
import React, { useMemo } from "react";
import { THEME } from "../config/theme";
import { CURRENCY, PRIVACY_FEE_PER_ZONE_THB, ZONE_PRICE_THB, computePrivacyRefundTHB } from "../utils/pricingConstants";
import { seatColumn, seatRowNum, getZoneForSeat } from "../utils/seatHelpers";
import { aircraftConfig } from "../config/aircraft";

/**
 * ShoppingBasketAll
 * Aggregates ALL passengers, grouped by FLIGHT (leg), and shows:
 * - Seat, zone, base price, privacy seat count × fee, estimated refund, leg total
 *
 * Props:
 *  - booking: parsed booking object (parseBooking(BOOKING_SOURCE))
 *  - assignments: { paxId: seatId }
 *  - privacyBySeat: { seatId: paxId }
 *  - lang: "EN" | "TH" (optional; default "EN")
 *  - compact: boolean (optional) renders concise rows
 */
export default function ShoppingBasketAll({
  booking,
  assignments = {},
  privacyBySeat = {},
  lang = "EN",
  compact = false,
}) {
  const L = labels(lang);
  const fmt = (n) => (Number(n) || 0).toLocaleString("th-TH");

  // Build per-leg summaries
  const legsSummary = useMemo(() => {
    if (!booking?.legs?.length) return [];

    return booking.legs.map((leg) => {
      const paxRows = (leg.passengers || []).map((p) => {
        const seatLabel = assignments[p.id] || "";
        const { zone, basePrice, unitPrivacyFee, refundPerSeat, privacyIds, privacyTotal, estRefund, total } =
          computeForPassenger(seatLabel, p.id, privacyBySeat);

        return {
          paxId: p.id,
          name: p.name,
          seat: seatLabel || "—",
          zone,
          basePrice,
          unitPrivacyFee,
          privacyIds,
          privacyCount: privacyIds.length,
          privacyTotal,
          refundPerSeat,
          estRefund,
          total,
        };
      });

      const legTotal = paxRows.reduce((s, r) => s + r.total, 0);

      return {
        key: leg.key,
        flightNo: leg.flightNo || `${leg.origin || ""}-${leg.destination || ""}`,
        origin: leg.origin,
        destination: leg.destination,
        date: leg.date,
        paxRows,
        legTotal,
      };
    });
  }, [booking, assignments, privacyBySeat]);

  if (!legsSummary.length) {
    return (
      <div className="border rounded-2xl p-3 sm:p-4 bg-white" style={{ borderColor: THEME.outline }}>
        <div className="font-semibold">{L.title}</div>
        <div className="text-sm mt-2 opacity-70">{L.noData}</div>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl p-3 sm:p-4 bg-white" style={{ borderColor: THEME.outline }}>
      <div className="font-semibold">{L.title}</div>

      {legsSummary.map((leg) => (
        <div key={leg.key} className="mt-3 pt-3 border-t" style={{ borderColor: THEME.outline }}>
          <div className="text-sm font-semibold">
            {L.flight}: {leg.flightNo} {leg.origin && leg.destination ? `(${leg.origin}→${leg.destination})` : ""}{" "}
            {leg.date ? `· ${leg.date}` : ""}
          </div>

          {/* Rows */}
          <div className="mt-2 space-y-2">
            {leg.paxRows.map((r) =>
              compact ? (
                <div key={r.paxId} className="text-[15px] md:text-sm text-blue-800">
                  <span className="font-medium">{r.name}</span>
                  {" · "}
                  <span>{L.seat}: {r.seat}</span>
                  {" | "}
                  <span>{L.privacy}: {r.privacyCount > 0 ? `${r.privacyCount} (${r.privacyIds.join(", ")}) × ${fmt(r.unitPrivacyFee)} ${CURRENCY}` : L.none}</span>
                  {" | "}
                  <span>{L.total}: {fmt(r.total)} {CURRENCY}</span>
                </div>
              ) : (
                <div key={r.paxId} className="border rounded-xl p-2" style={{ borderColor: THEME.outline }}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm opacity-80">{L.zone}: {r.zone || "-"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 text-sm mt-1">
                    <div>{L.seat}: <span className="font-medium">{r.seat}</span></div>
                    <div>{L.base}: <span className="font-medium">{fmt(r.basePrice)} {CURRENCY}</span></div>

                    <div>
                      {L.privacy}:{" "}
                      {r.privacyCount > 0
                        ? <span className="font-medium">{r.privacyCount} ({r.privacyIds.join(", ")}) × {fmt(r.unitPrivacyFee)} {CURRENCY} = {fmt(r.privacyTotal)} {CURRENCY}</span>
                        : <span className="opacity-70">{L.none}</span>}
                    </div>

                    <div>
                      {L.refundEst}:{" "}
                      {r.privacyCount > 0
                        ? <span className="font-medium">{fmt(r.estRefund)} {CURRENCY}</span>
                        : <span className="opacity-70">{L.none}</span>}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: THEME.outline }}>
                    <span className="font-semibold">{L.total}</span>
                    <span className="font-semibold">{fmt(r.total)} {CURRENCY}</span>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-2 text-sm font-semibold text-right">
            {L.legTotal}: {fmt(leg.legTotal)} {CURRENCY}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Helpers */
function computeForPassenger(seatLabel, paxId, privacyBySeat) {
  const zone = getZoneFromSeat(seatLabel);
  const basePrice = zone ? (ZONE_PRICE_THB[zone] ?? 0) : 0;
  const unitPrivacyFee = zone ? (PRIVACY_FEE_PER_ZONE_THB[zone] ?? 0) : 0;
  const refundPerSeat = zone ? computePrivacyRefundTHB(zone) : 0;

  const privacyIds = Object.entries(privacyBySeat || {})
    .filter(([sid, pid]) => pid === paxId)
    .map(([sid]) => sid)
    .sort();

  const privacyTotal = privacyIds.length * unitPrivacyFee;
  const estRefund = privacyIds.length * refundPerSeat;
  const total = basePrice + privacyTotal;

  return { zone, basePrice, unitPrivacyFee, refundPerSeat, privacyIds, privacyTotal, estRefund, total };
}

function getZoneFromSeat(seatLabel) {
  if (!seatLabel) return null;
  const r = seatRowNum(seatLabel);
  const c = seatColumn(seatLabel);
  if (!r || !c) return null;
  return getZoneForSeat(aircraftConfig, r, c) || null;
}

function labels(lang = "EN") {
  if (lang === "TH") {
    return {
      title: "ตะกร้าสรุปทั้งหมด (ตามเที่ยวบิน)",
      noData: "ยังไม่มีข้อมูล",
      flight: "เที่ยวบิน",
      seat: "ที่นั่ง",
      zone: "โซน",
      base: "ราคาเบื้องต้น",
      privacy: "ที่นั่งความเป็นส่วนตัว",
      refundEst: "ประมาณการเงินคืน",
      total: "รวม",
      legTotal: "รวมต่อเที่ยวบิน",
      none: "—",
    };
  }
  return {
    title: "Shopping Basket — All Passengers (by Flight)",
    noData: "No data yet",
    flight: "Flight",
    seat: "Seat",
    zone: "Zone",
    base: "Base price",
    privacy: "Privacy seats",
    refundEst: "Estimated refund",
    total: "Total",
    legTotal: "Leg total",
    none: "—",
  };
}
