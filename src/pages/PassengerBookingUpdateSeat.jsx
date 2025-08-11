import React, { useCallback, useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import ControlsBar from "../components/ControlsBar";
import PassengerList from "../components/PassengerList";
import PrivacyControls from "../components/PrivacyControls";
import SeatMap from "../components/SeatMap";

import { aircraftConfig } from "../config/aircraft";
import { STR } from "../i18n/strings";
import { THEME } from "../config/theme";
import { seatColumn, seatRowNum, groupForCol } from "../utils/seatHelpers";
import {
  LS_PREFIX, LS_PRIV_PREFIX,
  hydrateWithPaxKeys, loadAssignmentsForLeg, loadPrivacyForLeg, saveAll
} from "../utils/storage";
import { BOOKING_SOURCE, parseBooking } from "../data/booking";

export default function PassengerBookingUpdateSeat() {
  const [lang, setLang] = useState("EN");
  const t = STR[lang];

  const booking = useMemo(() => parseBooking(BOOKING_SOURCE), []);
  const [legIndex, setLegIndex] = useState(0);
  const currentLeg = booking.legs[legIndex];

  // Seed file seats for current leg
  const fileSeatMap = useMemo(() => {
    const m = {};
    for (const p of currentLeg.passengers) if (p.seat) m[p.id] = p.seat;
    return m;
  }, [currentLeg.passengers]);

  const paxIds = useMemo(() => currentLeg.passengers.map((p) => p.id), [currentLeg.passengers]);
  const legStorageKey = useMemo(() => `${LS_PREFIX}${currentLeg.key}`, [currentLeg.key]);
  const legPrivacyKey = useMemo(() => `${LS_PRIV_PREFIX}${currentLeg.key}`, [currentLeg.key]);

  const [assignments, setAssignments] = useState(() => loadAssignmentsForLeg(legStorageKey, fileSeatMap, paxIds));
  const [privacyBySeat, setPrivacyBySeat] = useState(() => loadPrivacyForLeg(legPrivacyKey)); // { seatId: ownerPaxId }
  const [selectedPassengerId, setSelectedPassengerId] = useState(currentLeg.passengers?.[0]?.id || null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [savedFlag, setSavedFlag] = useState(false);

  // Reload when leg changes
  useEffect(() => {
    const loaded = loadAssignmentsForLeg(legStorageKey, fileSeatMap, paxIds);
    const loadedPrivacy = loadPrivacyForLeg(legPrivacyKey);
    setAssignments(loaded);
    setPrivacyBySeat(loadedPrivacy);
    setSelectedPassengerId(currentLeg.passengers?.[0]?.id || null);
    setSelectedSeat(null);
    setSavedFlag(false);
  }, [legStorageKey, legPrivacyKey, currentLeg.passengers, fileSeatMap, paxIds]);

  // Auto-persist
  useEffect(() => { saveAll(legStorageKey, assignments); }, [legStorageKey, assignments]);
  useEffect(() => { saveAll(legPrivacyKey, privacyBySeat); }, [legPrivacyKey, privacyBySeat]);

  const bookedSet = useMemo(() => new Set(Object.values(assignments).filter(Boolean)), [assignments]);
  const blockedSet = useMemo(() => new Set(), []);

  const handleToggleSeat = useCallback((id) => setSelectedSeat((prev) => (prev === id ? null : id)), []);

  const clearAllPrivacyOfOwner = useCallback((ownerId) => {
    setPrivacyBySeat((prev) => {
      const next = { ...prev };
      Object.entries(next).forEach(([sid, pid]) => { if (pid === ownerId) delete next[sid]; });
      return next;
    });
  }, []);

  const handleBook = useCallback(() => {
    if (!selectedPassengerId || !selectedSeat) return;

    setAssignments((prev) => {
      const next = { ...prev };

      // If this seat had someone else's privacy, cancel ALL their privacy seats
      setPrivacyBySeat((prevPriv) => {
        const ownerOfPrivacy = prevPriv[selectedSeat];
        if (ownerOfPrivacy && ownerOfPrivacy !== selectedPassengerId) {
          const cleared = { ...prevPriv };
          Object.entries(cleared).forEach(([sid, pid]) => { if (pid === ownerOfPrivacy) delete cleared[sid]; });
          return cleared;
        }
        return prevPriv;
      });

      // If some pax already holds the seat, unassign them
      const seatOwner = Object.keys(next).find((pid) => next[pid] === selectedSeat);
      if (seatOwner && seatOwner !== selectedPassengerId) next[seatOwner] = "";

      // Moving pax → clear their privacy
      const currentSeat = next[selectedPassengerId];
      if (currentSeat && currentSeat !== selectedSeat) clearAllPrivacyOfOwner(selectedPassengerId);

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
    if (!window.confirm("Clear all local assignments & privacy for this flight?")) return;
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
    if (!window.confirm("Reset seats to the original file values for this flight? (Privacy will be cleared)")) return;
    const seeded = hydrateWithPaxKeys(paxIds, fileSeatMap);
    setAssignments(seeded);
    setPrivacyBySeat({});
    setSelectedSeat(null);
    saveAll(legStorageKey, seeded);
    saveAll(legPrivacyKey, {});
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1500);
  }, [fileSeatMap, paxIds, legStorageKey, legPrivacyKey]);

  // -------- Privacy logic --------
  const currentSeat = assignments[selectedPassengerId] || "";
  const eligiblePrivacySeats = useMemo(() => {
    if (!currentSeat) return [];
    const col = seatColumn(currentSeat);
    const row = seatRowNum(currentSeat);
    const group = groupForCol(col);
    return group
      .filter((c) => c !== col)
      .map((c) => `${c}${row}`)
      .filter((sid) => !bookedSet.has(sid));
  }, [currentSeat, bookedSet]);

  const privacyCost = (Object.values(privacyBySeat).filter((pid) => pid === selectedPassengerId).length || 0) * 150;

  const togglePrivacySeat = useCallback((sid) => {
    if (!selectedPassengerId) return;
    const owner = privacyBySeat[sid];
    if (owner && owner !== selectedPassengerId) { alert(t.privacy.taken); return; }
    setPrivacyBySeat((prev) => {
      const next = { ...prev };
      if (next[sid] === selectedPassengerId) delete next[sid];
      else next[sid] = selectedPassengerId;
      return next;
    });
  }, [selectedPassengerId, privacyBySeat, t.privacy.taken]);

  const clearPrivacyForCurrent = useCallback(() => {
    if (!selectedPassengerId) return;
    clearAllPrivacyOfOwner(selectedPassengerId);
  }, [selectedPassengerId, clearAllPrivacyOfOwner]);

  return (
    <div className="min-h-screen p-3 sm:p-4" style={{ backgroundColor: THEME.bg50 }}>
      <TopBar lang={lang} onToggleLang={() => setLang((p) => (p === "EN" ? "TH" : "EN"))} />

      {/* Mobile-first: stack; md+ becomes 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Left column: natural height on mobile; sticky/scroll on md+ */}
        <div className="bg-white border rounded-2xl p-4 sm:p-5"
             style={{ borderColor: THEME.outline }}>
          <div className="md:sticky md:top-4 md:max-h-[calc(100vh-120px)] md:overflow-auto">
            <ControlsBar
              t={t}
              lang={lang}
              setLang={setLang}
              booking={booking}
              legIndex={legIndex}
              setLegIndex={(i) => { setLegIndex(i); setSelectedSeat(null); setSavedFlag(false); }}
              selectedPassengerId={selectedPassengerId}
              setSelectedPassengerId={(id) => { setSelectedPassengerId(id); setSavedFlag(false); }}
              selectedSeat={selectedSeat}
              setSelectedSeat={setSelectedSeat}
              assignments={assignments}
              handleBook={handleBook}
              handleSaveLocal={handleSaveLocal}
              handleResetToFile={handleResetToFile}
              handleCancel={handleCancel}
              handleClearAll={handleClearAll}
              savedFlag={savedFlag}
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
              togglePrivacySeat={togglePrivacySeat}
              clearPrivacyForCurrent={clearPrivacyForCurrent}
            />
          </div>
        </div>

        {/* Right column: auto height on mobile; fixed viewport height only on md+ */}
        <div className="bg-white border rounded-2xl p-3 sm:p-4"
             style={{ borderColor: THEME.outline }}>
          {/* On mobile we let it grow naturally; on md+ we give it its own scroll area */}
          <div className="md:h-[80vh] md:overflow-auto">
            <SeatMap
              // NOTE: don't force h-full on mobile; allow natural stacking
              containerClassName="md:h-full"
              rows={aircraftConfig.rows}
              leftBlock={aircraftConfig.leftBlock}
              rightBlock={aircraftConfig.rightBlock}
              zones={aircraftConfig.zones}
              bookedSet={bookedSet}
              blockedSet={blockedSet}
              selectedSeat={selectedSeat}
              privacyBySeat={privacyBySeat}
              onToggleSeat={handleToggleSeat}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
