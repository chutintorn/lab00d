import React, { useCallback, useEffect, useMemo, useState } from "react";

import TopBar from "../components/TopBar";
import ControlsBar from "../components/ControlsBar";
import PassengerList from "../components/PassengerList";
import PrivacyControls from "../components/PrivacyControls";
import FareSummary from "../components/FareSummary";
import SeatMap from "../components/SeatMap";
import CurrentSelectionBar from "../components/CurrentSelectionBar";

import { aircraftConfig } from "../config/aircraft";
import { STR } from "../i18n/strings";
import { THEME } from "../config/theme";
import {
  seatColumn,
  seatRowNum,
  groupForCol,
  getZoneForSeat,
} from "../utils/seatHelpers";
import {
  LS_PREFIX,
  LS_PRIV_PREFIX,
  hydrateWithPaxKeys,
  loadAssignmentsForLeg,
  loadPrivacyForLeg,
  saveAll,
} from "../utils/storage";
import { BOOKING_SOURCE, parseBooking } from "../data/booking";
import {
  ZONE_PRICE_THB,
  PRIVACY_FEE_PER_ZONE_THB,
  computePrivacyRefundTHB,
} from "../utils/pricingConstants";

export default function PassengerBookingUpdateSeat() {
  const [lang, setLang] = useState("EN");
  const t = STR[lang];

  // Toggle to show/hide prices on the seat tiles
  const [showPrices, setShowPrices] = useState(false);

  const booking = useMemo(() => parseBooking(BOOKING_SOURCE), []);
  const [legIndex, setLegIndex] = useState(0);
  const currentLeg = booking.legs[legIndex];

  const fileSeatMap = useMemo(() => {
    const m = {};
    for (const p of currentLeg.passengers) if (p.seat) m[p.id] = p.seat;
    return m;
  }, [currentLeg.passengers]);

  const paxIds = useMemo(
    () => currentLeg.passengers.map((p) => p.id),
    [currentLeg.passengers]
  );
  const legStorageKey = useMemo(
    () => `${LS_PREFIX}${currentLeg.key}`,
    [currentLeg.key]
  );
  const legPrivacyKey = useMemo(
    () => `${LS_PRIV_PREFIX}${currentLeg.key}`,
    [currentLeg.key]
  );

  const [assignments, setAssignments] = useState(() =>
    loadAssignmentsForLeg(legStorageKey, fileSeatMap, paxIds)
  );
  const [privacyBySeat, setPrivacyBySeat] = useState(() =>
    loadPrivacyForLeg(legPrivacyKey)
  );
  const [selectedPassengerId, setSelectedPassengerId] = useState(
    currentLeg.passengers?.[0]?.id || null
  );
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [savedFlag, setSavedFlag] = useState(false);

  // Load per-leg data (assignments + privacy). Seed from file once if empty.
  useEffect(() => {
    const loaded = loadAssignmentsForLeg(legStorageKey, fileSeatMap, paxIds);
    const loadedPrivacy = loadPrivacyForLeg(legPrivacyKey);

    setAssignments(loaded);
    setPrivacyBySeat(loadedPrivacy);
    setSelectedPassengerId(currentLeg.passengers?.[0]?.id || null);
    setSelectedSeat(null);
    setSavedFlag(false);

    const hasAnyStoredSeat = Object.values(loaded).some(Boolean);
    const fileHasSeats = Object.keys(fileSeatMap).length > 0;
    if (!hasAnyStoredSeat && fileHasSeats) {
      const seeded = hydrateWithPaxKeys(paxIds, fileSeatMap);
      setAssignments(seeded);
      setPrivacyBySeat({});
      saveAll(legStorageKey, seeded);
      saveAll(legPrivacyKey, {});
    }
  }, [
    legStorageKey,
    legPrivacyKey,
    currentLeg.passengers,
    fileSeatMap,
    paxIds,
  ]);

  // Persist on change
  useEffect(() => {
    saveAll(legStorageKey, assignments);
  }, [legStorageKey, assignments]);

  useEffect(() => {
    saveAll(legPrivacyKey, privacyBySeat);
  }, [legPrivacyKey, privacyBySeat]);

  // Derived sets
  const bookedSet = useMemo(
    () => new Set(Object.values(assignments).filter(Boolean)),
    [assignments]
  );
  const blockedSet = useMemo(() => new Set(), []);

  // UI handlers
  const handleToggleSeat = useCallback(
    (id) => setSelectedSeat((prev) => (prev === id ? null : id)),
    []
  );

  const clearAllPrivacyOfOwner = useCallback((ownerId) => {
    setPrivacyBySeat((prev) => {
      const next = { ...prev };
      Object.entries(next).forEach(([sid, pid]) => {
        if (pid === ownerId) delete next[sid];
      });
      return next;
    });
  }, []);

  const handleBook = useCallback(() => {
    if (!selectedPassengerId || !selectedSeat) return;

    setAssignments((prev) => {
      const next = { ...prev };

      // If seat is owned as privacy by someone else, clear all their privacy seats
      setPrivacyBySeat((prevPriv) => {
        const ownerOfPrivacy = prevPriv[selectedSeat];
        if (ownerOfPrivacy && ownerOfPrivacy !== selectedPassengerId) {
          const cleared = { ...prevPriv };
          Object.entries(cleared).forEach(([sid, pid]) => {
            if (pid === ownerOfPrivacy) delete cleared[sid];
          });
          return cleared;
        }
        return prevPriv;
      });

      // If another pax already sits here, remove their assignment
      const seatOwner = Object.keys(next).find(
        (pid) => next[pid] === selectedSeat
      );
      if (seatOwner && seatOwner !== selectedPassengerId) next[seatOwner] = "";

      // If current pax is moving seats, clear their previous privacy
      const currentSeatOfPax = next[selectedPassengerId];
      if (currentSeatOfPax && currentSeatOfPax !== selectedSeat)
        clearAllPrivacyOfOwner(selectedPassengerId);

      next[selectedPassengerId] = selectedSeat;
      return next;
    });

    setSelectedSeat(null);
    setSavedFlag(false);
  }, [selectedPassengerId, selectedSeat, clearAllPrivacyOfOwner]);

  const handleCancel = useCallback(() => {
    if (!selectedPassengerId) return;
    setAssignments((prev) => ({ ...prev, [selectedPassengerId]: "" }));
    clearAllPrivacyOfOwner(selectedPassengerId);
    setSelectedSeat(null);
    setSavedFlag(false);
  }, [selectedPassengerId, clearAllPrivacyOfOwner]);

  const handleClearAll = useCallback(() => {
    if (!window.confirm("Clear all local assignments & privacy for this flight?"))
      return;
    const empty = {};
    for (const id of paxIds) empty[id] = "";
    setAssignments(empty);
    setPrivacyBySeat({});
    setSelectedSeat(null);
    setSavedFlag(false);
  }, [paxIds]);

  const handleSaveLocal = useCallback(() => {
    saveAll(legStorageKey, assignments);
    saveAll(legPrivacyKey, privacyBySeat);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1500);
  }, [legStorageKey, legPrivacyKey, assignments, privacyBySeat]);

  const handleResetToFile = useCallback(() => {
    if (
      !window.confirm(
        "Reset seats to the original file values for this flight? (Privacy will be cleared)"
      )
    )
      return;
    const seeded = hydrateWithPaxKeys(paxIds, fileSeatMap);
    setAssignments(seeded);
    setPrivacyBySeat({});
    setSelectedSeat(null);
    saveAll(legStorageKey, seeded);
    saveAll(legPrivacyKey, {});
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1500);
  }, [fileSeatMap, paxIds, legStorageKey, legPrivacyKey]);

  const handleConfirmPrivacy = useCallback(() => {
    saveAll(legPrivacyKey, privacyBySeat);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1200);
  }, [legPrivacyKey, privacyBySeat]);

  // -------- Current pax derived values --------
  const currentSeat = assignments[selectedPassengerId] || "";

  const currentZone = useMemo(() => {
    if (!currentSeat) return null;
    const r = seatRowNum(currentSeat);
    const c = seatColumn(currentSeat);
    if (!r || !c) return null;
    return getZoneForSeat(aircraftConfig, r, c) || "happy";
  }, [currentSeat]);

  const unitPrivacyFeeTHB = useMemo(() => {
    if (!currentZone) return 0;
    return PRIVACY_FEE_PER_ZONE_THB[currentZone] ?? 0;
  }, [currentZone]);

  const baseSeatPriceTHB = useMemo(() => {
    if (!currentZone) return 0;
    return ZONE_PRICE_THB[currentZone] ?? 0;
  }, [currentZone]);

  const refundPerSeatTHB = useMemo(() => {
    if (!currentZone) return 0;
    return computePrivacyRefundTHB(currentZone);
  }, [currentZone]);

  const privacyCountForPax = useMemo(
    () => Object.values(privacyBySeat).filter((pid) => pid === selectedPassengerId).length,
    [privacyBySeat, selectedPassengerId]
  );

  // NEW 👉 build the actual seat labels for this passenger's privacy seats
  const privacySeatIdsForCurrentPax = useMemo(
    () =>
      Object.entries(privacyBySeat || {})
        .filter(([sid, pid]) => pid === selectedPassengerId)
        .map(([sid]) => sid)
        .sort(),
    [privacyBySeat, selectedPassengerId]
  );

  const privacyCost = (privacyCountForPax || 0) * (unitPrivacyFeeTHB || 0);

  // Eligible privacy = same row, same block, not booked
  const eligiblePrivacySeats = useMemo(() => {
    if (!currentSeat) return [];
    const col = seatColumn(currentSeat);
    const row = seatRowNum(currentSeat);
    if (!row) return [];
    const group = groupForCol(col);
    return group
      .filter((c) => c !== col)
      .map((c) => `${row}${c}`)
      .filter((sid) => !bookedSet.has(sid));
  }, [currentSeat, bookedSet]);

  const togglePrivacySeat = useCallback(
    (sid) => {
      if (!selectedPassengerId) return;
      const owner = privacyBySeat[sid];
      if (owner && owner !== selectedPassengerId) {
        alert(t.privacy.taken);
        return;
      }
      setPrivacyBySeat((prev) => {
        const next = { ...prev };
        if (next[sid] === selectedPassengerId) delete next[sid];
        else next[sid] = selectedPassengerId;
        return next;
      });
    },
    [selectedPassengerId, privacyBySeat, t.privacy.taken]
  );

  const clearPrivacyForCurrent = useCallback(() => {
    if (!selectedPassengerId) return;
    clearAllPrivacyOfOwner(selectedPassengerId);
  }, [selectedPassengerId, clearAllPrivacyOfOwner]);

  // -------- Render --------
  return (
    <div className="min-h-screen p-3 sm:p-4" style={{ backgroundColor: THEME.bg50 }}>
      <TopBar lang={lang} onToggleLang={() => setLang((p) => (p === "EN" ? "TH" : "EN"))} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* LEFT PANEL */}
        <div
          className="bg-white border rounded-2xl p-4 sm:p-5"
          style={{ borderColor: THEME.outline }}
        >
          <div className="md:sticky md:top-4 md:h-[calc(100vh-120px)] md:max-h-[calc(100vh-120px)] md:overflow-auto">

            {/* Current passenger summary */}
            <CurrentSelectionBar
              t={t}
              passengerName={
                currentLeg.passengers.find((p) => p.id === selectedPassengerId)?.name || ""
              }
              currentSeat={currentSeat}
              zoneType={currentZone}
              basePriceTHB={baseSeatPriceTHB}
              privacyCount={privacyCountForPax}
              unitPrivacyFeeTHB={unitPrivacyFeeTHB}
              /* NEW: show actual seat numbers, e.g., (1A, 1B) */
              privacySeatIds={privacySeatIdsForCurrentPax}
            />

            <ControlsBar
              t={t}
              lang={lang}
              setLang={setLang}
              booking={booking}
              legIndex={legIndex}
              setLegIndex={(i) => {
                setLegIndex(i);
                setSelectedSeat(null);
                setSavedFlag(false);
              }}
              selectedPassengerId={selectedPassengerId}
              setSelectedPassengerId={(id) => {
                setSelectedPassengerId(id);
                setSavedFlag(false);
              }}
              selectedSeat={selectedSeat}
              setSelectedSeat={setSelectedSeat}
              assignments={assignments}
              handleBook={handleBook}
              handleSaveLocal={handleSaveLocal}
              handleResetToFile={handleResetToFile}
              handleCancel={() => {
                if (!selectedPassengerId) return;
                setAssignments((prev) => ({ ...prev, [selectedPassengerId]: "" }));
                clearAllPrivacyOfOwner(selectedPassengerId);
                setSelectedSeat(null);
                setSavedFlag(false);
              }}
              handleClearAll={() => {
                if (!window.confirm("Clear all local assignments & privacy for this flight?"))
                  return;
                const empty = {};
                for (const id of paxIds) empty[id] = "";
                setAssignments(empty);
                setPrivacyBySeat({});
                setSelectedSeat(null);
                setSavedFlag(false);
              }}
              savedFlag={savedFlag}
              showPrices={showPrices}
              onToggleShowPrices={() => setShowPrices((v) => !v)}
            />

            <PassengerList
              passengers={currentLeg.passengers}
              assignments={assignments}
              selectedPassengerId={selectedPassengerId}
              noneLabel={t.none}
            />

            <PrivacyControls
              t={t}
              currentSeat={currentSeat}
              eligiblePrivacySeats={eligiblePrivacySeats}
              privacyBySeat={privacyBySeat}
              selectedPassengerId={selectedPassengerId}
              privacyCost={privacyCost}
              unitPrivacyFeeTHB={unitPrivacyFeeTHB}
              refundPerSeatTHB={refundPerSeatTHB}
              togglePrivacySeat={togglePrivacySeat}
              clearPrivacyForCurrent={clearPrivacyForCurrent}
              onConfirmPrivacy={handleConfirmPrivacy}
              savedFlag={savedFlag}
            />

            <FareSummary
              t={t}
              basePriceTHB={baseSeatPriceTHB}
              privacyCount={privacyCountForPax}
              unitPrivacyFeeTHB={unitPrivacyFeeTHB}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="bg-white border rounded-2xl p-3 sm:p-4"
          style={{ borderColor: THEME.outline }}
        >
          <div className="md:h-[calc(100vh-120px)] md:max-h-[calc(100vh-120px)] md:overflow-auto">
            <SeatMap
              containerClassName="h-full"
              rows={aircraftConfig.rows}
              leftBlock={aircraftConfig.leftBlock}
              rightBlock={aircraftConfig.rightBlock}
              zones={aircraftConfig.zones}
              bookedSet={bookedSet}
              blockedSet={blockedSet}
              selectedSeat={selectedSeat}
              privacyBySeat={privacyBySeat}
              onToggleSeat={handleToggleSeat}
              highlightSeat={assignments[selectedPassengerId] || ""}
              showPrices={showPrices}
              selectedPassengerId={selectedPassengerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
