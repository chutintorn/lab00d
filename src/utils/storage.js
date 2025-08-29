// src/utils/storage.js

// ---------------------------------------------
// LocalStorage keys (prefixes) — keep consistent
// ---------------------------------------------
export const LS_PREFIX = "seatmap:assignment:";   // paxId -> seat (scoped by legKey)
export const LS_PRIV_PREFIX = "seatmap:privacy:"; // seatId -> ownerPaxId (scoped by legKey)

// ---------------------------------------------
// First-time/Version seeding helpers
// Bump CURRENT_SEAT_SEED_VER when seat-id format/logic changes
// ---------------------------------------------
export const CURRENT_SEAT_SEED_VER = "2";
export const seedVerKeyForLeg = (legKey) => `seat:seedver:${legKey}`;
export const getSeedVersionForLeg = (legKey) =>
  localStorage.getItem(seedVerKeyForLeg(legKey));
export const setSeedVersionForLeg = (legKey) =>
  localStorage.setItem(seedVerKeyForLeg(legKey), CURRENT_SEAT_SEED_VER);

// ---------------------------------------------
// Optional: canonical key builders
// ---------------------------------------------
export const storageKeyForLeg = (legKey) => `${LS_PREFIX}${legKey}`;
export const privacyKeyForLeg  = (legKey) => `${LS_PRIV_PREFIX}${legKey}`;

// ---------------------------------------------
// Utils
// ---------------------------------------------
export function safeParse(str, fallback) {
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Ensure the returned object has all paxIds as keys.
 * Any missing pax id will be initialized with base?.[id] or "".
 */
export function hydrateWithPaxKeys(paxIds, base) {
  const out = { ...base };
  paxIds.forEach((id) => {
    if (!(id in out)) out[id] = base?.[id] ?? "";
  });
  return out;
}

// ---------------------------------------------
// Legacy migration (kept minimal / no-op by default)
// ---------------------------------------------
function migrateOldIfAny(fileSeatMap) {
  const oldRaw = localStorage.getItem("seatBookings:v1");
  if (!oldRaw) return null;
  return { ...fileSeatMap };
}

// ---------------------------------------------
// Loaders / Savers
// ---------------------------------------------

/**
 * Load seat assignments for a leg.
 * - storageKey: LocalStorage key (string), e.g., storageKeyForLeg(legKey)
 * - fileSeatMap: default map from file (object: paxId -> seatId or "")
 * - paxIds: array of passenger IDs to ensure presence
 * Returns: object { paxId: seatId }
 */
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

/**
 * Save seat assignments for a leg.
 * data shape: { paxId: seatId }
 */
export function saveAssignmentsForLeg(storageKey, data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

/**
 * Load privacy map for a leg.
 * - privacyKey: LocalStorage key (string), e.g., privacyKeyForLeg(legKey)
 * Returns: object { seatId: ownerPaxId }
 */
export function loadPrivacyForLeg(privacyKey) {
  const raw = localStorage.getItem(privacyKey);
  return safeParse(raw, {}); // { seatId: ownerPaxId }
}

/**
 * Save privacy map for a leg.
 * data shape: { seatId: ownerPaxId }
 */
export function savePrivacyForLeg(privacyKey, data) {
  localStorage.setItem(privacyKey, JSON.stringify(data));
}

/**
 * Generic saver (kept for backward-compat with your code)
 */
export function saveAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------------------------------------------
// GLOBAL HELPERS
// ---------------------------------------------

/**
 * Clear this passenger's seat + privacy on ALL legs.
 * - Sets assignments[paxId] = "" for every key starting with LS_PREFIX
 * - Removes any privacy entries where owner === paxId for keys starting with LS_PRIV_PREFIX
 *
 * Returns: { ok: true, changed: {assignments: n, privacy: m} } | { ok: false, error }
 */
export function clearPassengerAllLegs(paxId) {
  try {
    const assignKeys = [];
    const privKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(LS_PREFIX)) assignKeys.push(k);
      else if (k.startsWith(LS_PRIV_PREFIX)) privKeys.push(k);
    }

    let changedAssign = 0;
    let changedPriv = 0;

    // Wipe this pax's seat across all legs
    assignKeys.forEach((k) => {
      const map = safeParse(localStorage.getItem(k), {});
      if (map && typeof map === "object" && Object.prototype.hasOwnProperty.call(map, paxId)) {
        if (map[paxId] !== "") {
          map[paxId] = "";
          localStorage.setItem(k, JSON.stringify(map));
          changedAssign++;
        }
      }
    });

    // Remove this pax's privacy seats across all legs
    privKeys.forEach((k) => {
      const priv = safeParse(localStorage.getItem(k), {});
      let touched = false;
      Object.keys(priv).forEach((seatId) => {
        if (priv[seatId] === paxId) {
          delete priv[seatId];
          touched = true;
        }
      });
      if (touched) {
        localStorage.setItem(k, JSON.stringify(priv));
        changedPriv++;
      }
    });

    return { ok: true, changed: { assignments: changedAssign, privacy: changedPriv } };
  } catch (e) {
    console.error("clearPassengerAllLegs error:", e);
    return { ok: false, error: String(e) };
  }
}

/**
 * OPTIONAL: Clear ALL passengers' seats + privacy on ALL legs
 * (Used if you want a storage-level helper; your page can also loop legs)
 *
 * Returns: { ok: true, legs: {assignments: x, privacy: y} } | { ok: false, error }
 */
export function clearEveryoneAllLegs() {
  try {
    const assignKeys = [];
    const privKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(LS_PREFIX)) assignKeys.push(k);
      else if (k.startsWith(LS_PRIV_PREFIX)) privKeys.push(k);
    }

    let legsAssignments = 0;
    let legsPrivacy = 0;

    // For each assignments map, set all pax -> ""
    assignKeys.forEach((k) => {
      const map = safeParse(localStorage.getItem(k), {});
      if (map && typeof map === "object") {
        const emptied = {};
        Object.keys(map).forEach((pid) => (emptied[pid] = ""));
        localStorage.setItem(k, JSON.stringify(emptied));
        legsAssignments++;
      }
    });

    // For each privacy map, clear it
    privKeys.forEach((k) => {
      localStorage.setItem(k, JSON.stringify({}));
      legsPrivacy++;
    });

    return { ok: true, legs: { assignments: legsAssignments, privacy: legsPrivacy } };
  } catch (e) {
    console.error("clearEveryoneAllLegs error:", e);
    return { ok: false, error: String(e) };
  }
}

// ---------------------------------------------
// GLOBAL CLEAR — Clear ALL carts for ALL flights & passengers
// (hard reset of all seat/prv/seed keys)
// ---------------------------------------------
/**
 * Removes every LocalStorage key related to seat assignments/privacy/seed version
 * across all legs. Does NOT call localStorage.clear() — so unrelated app data survives.
 *
 * Returns: { ok: true, removed: number } on success
 *          { ok: false, error: string } on failure
 */
export function clearAllShoppingData() {
  try {
    const prefixes = [
      LS_PREFIX,       // "seatmap:assignment:" (paxId -> seat)
      LS_PRIV_PREFIX,  // "seatmap:privacy:"    (seatId -> ownerPaxId)
      "seat:seedver:", // per-leg seeding/version
    ];

    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (prefixes.some((p) => k.startsWith(p))) {
        toRemove.push(k);
      }
    }

    toRemove.forEach((k) => localStorage.removeItem(k));

    // Optionally remove a few standalone keys
    const singleKeys = ["selectedPassengerId", "activeLegIndex", "fareSummaryCache"];
    singleKeys.forEach((k) => {
      if (localStorage.getItem(k) !== null) localStorage.removeItem(k);
    });

    return { ok: true, removed: toRemove.length + singleKeys.length };
  } catch (e) {
    console.error("clearAllShoppingData error:", e);
    return { ok: false, error: String(e) };
  }
}
