// Build a seat id in row–col format (e.g., 1A, 12C)
export const seatId = (c, r) => `${r}${c}`;

// "1A" or "A1" -> "A"
export const seatColumn = (id) => {
  if (!id) return "";
  const s = String(id).trim().toUpperCase();
  const m = s.match(/^(\d+)([A-Z]+)$/) || s.match(/^([A-Z]+)(\d+)$/);
  return m ? (m[2].match(/^[A-Z]+$/) ? m[2] : m[1]) : s.replace(/\d+/g, "");
};

// "1A" or "A1" -> 1
export const seatRowNum = (id) => {
  if (!id) return 0;
  const s = String(id).trim().toUpperCase();
  const m = s.match(/^(\d+)([A-Z]+)$/) || s.match(/^([A-Z]+)(\d+)$/);
  if (m) {
    // pick the numeric group
    const n = parseInt(m[1].match(/^\d+$/) ? m[1] : m[2], 10);
    return Number.isFinite(n) ? n : 0;
  }
  const n = parseInt(s.replace(/\D+/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

export const seatTypeFor = (row, zones) =>
  zones.find((z) => row >= z.from && row <= z.to)?.type || "happy";

export const groupForCol = (col) =>
  ("ABC".includes(col) ? ["A", "B", "C"] : ["H", "J", "K"]);
