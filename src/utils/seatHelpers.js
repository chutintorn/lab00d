export const seatId = (c, r) => `${c}${r}`;
export const seatTypeFor = (row, zones) => zones.find((z) => row >= z.from && row <= z.to)?.type || "happy";
export const seatColumn = (id) => id.replace(/\d+/g, "");
export const seatRowNum = (id) => parseInt(id.replace(/\D+/g, ""), 10);
export const groupForCol = (col) => ("ABC".includes(col) ? ["A", "B", "C"] : ["H", "J", "K"]);
