// src/utils/seatHelpers.js
import { ZONE_PRICE_THB } from "./pricingConstants";

/** Build a seat id in row–col format (e.g., "1A", "12C") */
export const seatId = (c, r) => `${r}${c}`;

/** "1A" or "A1" -> "A" */
export const seatColumn = (id) => {
  if (!id) return "";
  const s = String(id).trim().toUpperCase();
  const m = s.match(/^(\d+)([A-Z]+)$/) || s.match(/^([A-Z]+)(\d+)$/);
  return m ? (m[2].match(/^[A-Z]+$/) ? m[2] : m[1]) : s.replace(/\d+/g, "");
};

/** "1A" or "A1" -> 1 */
export const seatRowNum = (id) => {
  if (!id) return 0;
  const s = String(id).trim().toUpperCase();
  const m = s.match(/^(\d+)([A-Z]+)$/) || s.match(/^([A-Z]+)(\d+)$/);
  if (m) {
    const n = parseInt(m[1].match(/^\d+$/) ? m[1] : m[2], 10);
    return Number.isFinite(n) ? n : 0;
  }
  const n = parseInt(s.replace(/\D+/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/** Which side group a column belongs to (left ABC vs right HJK) */
export const groupForCol = (colInput) => {
  const col = String(colInput || "").toUpperCase();
  return "ABC".includes(col) ? ["A", "B", "C"] : ["H", "J", "K"];
};

// Legacy row-only resolver (kept for compatibility)
export const seatTypeFor = (row, zones = []) =>
  zones.find(
    (z) =>
      Number.isFinite(z?.from) &&
      Number.isFinite(z?.to) &&
      Number(row) >= z.from &&
      Number(row) <= z.to
  )?.type || "happy";

// ---------- New zone helpers with explicit seat overrides ----------

export function normalizeSeatCode(input) {
  if (!input) return "";
  const s = String(input).trim().toUpperCase();
  const m1 = s.match(/^(\d+)([A-Z]+)$/);
  if (m1) return `${parseInt(m1[1], 10)}${m1[2]}`;
  const m2 = s.match(/^([A-Z]+)(\d+)$/);
  if (m2) return `${parseInt(m2[2], 10)}${m2[1]}`;
  const stripped = s.replace(/[^A-Z0-9]/g, "");
  const m3 = stripped.match(/^(\d+)([A-Z]+)$/) || stripped.match(/^([A-Z]+)(\d+)$/);
  if (m3) {
    const row = m3[1].match(/^\d+$/) ? m3[1] : m3[2];
    const col = m3[2].match(/^[A-Z]+$/) ? m3[2] : m3[1];
    return `${parseInt(row, 10)}${col}`;
  }
  return "";
}

function isSeatInExplicitList(zone, normCode) {
  if (!zone || !Array.isArray(zone.seats)) return false;
  for (const s of zone.seats) {
    if (normalizeSeatCode(s) === normCode) return true;
  }
  return false;
}

/**
 * Resolve a zone from a zones array for a specific seat (row, col).
 * Checks explicit seat overrides first, then row-range zones.
 */
export function zoneFromZones(zones = [], rowNumber, colLetter) {
  if (!Array.isArray(zones)) return null;
  const row = Number(rowNumber);
  const col = String(colLetter || "").toUpperCase();
  const code = normalizeSeatCode(`${row}${col}`);
  if (!code) return null;

  for (const z of zones) {
    if (isSeatInExplicitList(z, code)) return z.type || null;
  }
  const byRow = zones.find(
    (z) =>
      Number.isFinite(z?.from) &&
      Number.isFinite(z?.to) &&
      row >= z.from &&
      row <= z.to
  );
  return byRow?.type ?? null;
}

/** Preferred API when you have row + col and only zones array. */
export function seatTypeForSeat(rowNumber, colLetter, zones) {
  return zoneFromZones(zones, rowNumber, colLetter) || "happy";
}

/** Resolve zone from the full aircraftConfig (which contains zones). */
export function getZoneForSeat(aircraftCfg, rowNumber, colLetter) {
  const zones = aircraftCfg?.zones || [];
  return zoneFromZones(zones, rowNumber, colLetter) || "happy";
}

/** Get price (THB) for a seat based on zone. */
export function getSeatPriceTHB(aircraftCfg, rowNumber, colLetter) {
  const zone = getZoneForSeat(aircraftCfg, rowNumber, colLetter);
  return ZONE_PRICE_THB[zone] ?? 0;
}
