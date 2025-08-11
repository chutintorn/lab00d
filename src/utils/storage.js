export const LS_PREFIX = "seatmap:assignment:";   // paxId -> seat
export const LS_PRIV_PREFIX = "seatmap:privacy:"; // seatId -> ownerPaxId

export function safeParse(str, fallback) {
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function hydrateWithPaxKeys(paxIds, base) {
  const out = { ...base };
  paxIds.forEach((id) => { if (!(id in out)) out[id] = base?.[id] ?? ""; });
  return out;
}

function migrateOldIfAny(fileSeatMap) {
  const oldRaw = localStorage.getItem("seatBookings:v1");
  if (!oldRaw) return null;
  return { ...fileSeatMap };
}

export function loadAssignmentsForLeg(storageKey, fileSeatMap, paxIds) {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    const parsed = safeParse(raw, {});
    if (Array.isArray(parsed)) return hydrateWithPaxKeys(paxIds, fileSeatMap);
    return hydrateWithPaxKeys(paxIds, parsed);
  }
  const migrated = migrateOldIfAny(fileSeatMap);
  if (migrated) return hydrateWithPaxKeys(paxIds, migrated);
  return hydrateWithPaxKeys(paxIds, fileSeatMap);
}

export function loadPrivacyForLeg(privacyKey) {
  const raw = localStorage.getItem(privacyKey);
  return safeParse(raw, {}); // { seatId: ownerPaxId }
}

export function saveAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
