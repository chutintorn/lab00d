// src/pages/PassengerBookingUpdateSeat.jsx
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
  CURRENCY,
} from "../utils/pricingConstants";

import Collapse from "../components/Collapse";

/* ------------------------------------------------------------------
 * Localized labels (EN/TH) for cart + checkout + share/email
 * ------------------------------------------------------------------ */
function LBL(lang = "EN") {
  if (lang === "TH") {
    return {
      cartTitle: "🛒 รถเข็น (ทั้งหมด • ตามเที่ยวบิน)",
      manageSeat: "จัดการที่นั่ง",
      flight: "เที่ยวบิน",
      seat: "ที่นั่ง",
      privacy: "ความเป็นส่วนตัว",
      total: "รวม",
      zone: "โซน",
      base: "ราคาเบื้องต้น",
      refundEst: "ประมาณการเงินคืน",
      legTotal: "รวมต่อเที่ยวบิน",
      grandTotal: "รวมทั้งสิ้น (ทุกเที่ยวบิน)",
      none: "—",
      noData: "ยังไม่มีข้อมูล",
      // buttons
      saveSelection: "บันทึกการเลือก",
      continuePayment: "ชำระเงินต่อ",
      closeCart: "ปิดรถเข็น",
      shareLine: "แชร์ไปยัง LINE",
      emailCart: "ส่งอีเมล",
      // checkout modal
      checkout: "ชำระเงิน",
      paymentMethod: "วิธีการชำระเงิน",
      creditCard: "บัตรเครดิต",
      bankTransfer: "โอนผ่านธนาคาร",
      qrCode: "คิวอาร์โค้ด",
      payNow: "ชำระเงิน",
      cancel: "ยกเลิก",
      cardNumber: "หมายเลขบัตร",
      nameOnCard: "ชื่อบนบัตร",
      expiry: "วันหมดอายุ (MM/YY)",
      cvv: "CVV",
      bank: "ธนาคาร",
      accountNo: "เลขที่บัญชี",
      reference: "อ้างอิงการชำระเงิน",
      uploadSlip: "อัปโหลดสลิป (ไม่บังคับ)",
      qrNote: "สแกนคิวอาร์เพื่อชำระเงิน",
      // share/email
      shareTitle: "สรุปตะกร้าที่นั่ง",
      shareCopyFallback: "คัดลอกข้อความไปยังคลิปบอร์ดแล้ว",
    };
  }
  return {
    cartTitle: "🛒 Shopping Cart (All • by Flight)",
    manageSeat: "Seat Management",
    flight: "Flight",
    seat: "Seat",
    privacy: "Privacy",
    total: "Total",
    zone: "Zone",
    base: "Base",
    refundEst: "Estimated refund",
    legTotal: "Leg total",
    grandTotal: "Grand Total (all legs)",
    none: "—",
    noData: "No data yet",
    // buttons
    saveSelection: "Save Selection",
    continuePayment: "Continue Payment",
    closeCart: "Close Cart",
    shareLine: "Share to LINE",
    emailCart: "Email Cart",
    // checkout modal
    checkout: "Checkout",
    paymentMethod: "Payment Method",
    creditCard: "Credit Card",
    bankTransfer: "Bank Transfer",
    qrCode: "QR Code",
    payNow: "Pay Now",
    cancel: "Cancel",
    cardNumber: "Card Number",
    nameOnCard: "Name on Card",
    expiry: "Expiry (MM/YY)",
    cvv: "CVV",
    bank: "Bank",
    accountNo: "Account No.",
    reference: "Payment Reference",
    uploadSlip: "Upload Slip (optional)",
    qrNote: "Scan this QR to pay",
    // share/email
    shareTitle: "Seat Cart Summary",
    shareCopyFallback: "Copied summary to clipboard",
  };
}

export default function PassengerBookingUpdateSeat() {
  const [lang, setLang] = useState("EN");
  const t = STR[lang];
  const L = LBL(lang);
  const fmt = (n) => (Number(n) || 0).toLocaleString("th-TH");

  // Toggle to show/hide prices on the seat tiles
  const [showPrices, setShowPrices] = useState(false);

  // Show/hide ALL-PASSENGERS shopping cart (LEFT PANEL, under FareSummary)
  const [showCart, setShowCart] = useState(true);

  // Checkout modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'bank' | 'qr'

  const booking = useMemo(() => parseBooking(BOOKING_SOURCE), []);
  const [legIndex, setLegIndex] = useState(0);
  const currentLeg = booking.legs[legIndex];

  // Bonus: build a short title like "TG123 BKK→HKT / TG124 HKT→BKK"
  const bookingTitle = useMemo(() => {
    if (!booking?.legs?.length) return "";
    return booking.legs
      .map((leg) => {
        const code = leg.flightNo || `${leg.origin || ""}-${leg.destination || ""}`;
        const route =
          leg.origin && leg.destination ? `${leg.origin}→${leg.destination}` : "";
        return route ? `${code} ${route}` : code;
      })
      .join(" / ");
  }, [booking]);

  /* -------------------------------------------
   * Build file seat map for the current leg
   * ------------------------------------------- */
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

  /* -------------------------------------------
   * Per-leg (active leg) state
   * ------------------------------------------- */
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

  /* -------------------------------------------
   * Load per-leg data on leg switch + seed
   * ------------------------------------------- */
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

  /* -------------------------------------------
   * Current pax derived values
   * ------------------------------------------- */
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
    () =>
      Object.values(privacyBySeat).filter(
        (pid) => pid === selectedPassengerId
      ).length,
    [privacyBySeat, selectedPassengerId]
  );

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

  /* -------------------------------------------
   * ALL-PASSENGERS SHOPPING CART (reads every leg from localStorage)
   * ------------------------------------------- */
  const legsCart = useMemo(() => {
    if (!booking?.legs?.length) return [];

    const computeZoneFromSeat = (seatLabel) => {
      if (!seatLabel) return null;
      const r = seatRowNum(seatLabel);
      const c = seatColumn(seatLabel);
      if (!r || !c) return null;
      return getZoneForSeat(aircraftConfig, r, c) || null;
    };

    return booking.legs.map((leg) => {
      const paxIdsForLeg = (leg.passengers || []).map((p) => p.id);

      // File seats for that leg
      const fileMapLeg = {};
      (leg.passengers || []).forEach((p) => {
        if (p.seat) fileMapLeg[p.id] = p.seat;
      });

      const legKey = `${LS_PREFIX}${leg.key}`;
      const legPrivKey = `${LS_PRIV_PREFIX}${leg.key}`;

      const assLeg = loadAssignmentsForLeg(legKey, fileMapLeg, paxIdsForLeg);
      const privLeg = loadPrivacyForLeg(legPrivKey);

      const paxRows = (leg.passengers || []).map((p) => {
        const seatLabel = assLeg[p.id] || "";
        const zone = computeZoneFromSeat(seatLabel);
        const base = zone ? (ZONE_PRICE_THB[zone] ?? 0) : 0;
        const unitPriv = zone ? (PRIVACY_FEE_PER_ZONE_THB[zone] ?? 0) : 0;
        const refundEach = zone ? computePrivacyRefundTHB(zone) : 0;

        const privacyIds = Object.entries(privLeg || {})
          .filter(([sid, pid]) => pid === p.id)
          .map(([sid]) => sid)
          .sort();

        const privacyTotal = privacyIds.length * unitPriv;
        const estRefund = privacyIds.length * refundEach;
        const total = base + privacyTotal;

        return {
          paxId: p.id,
          name: p.name,
          seat: seatLabel || L.none,
          zone: zone || "",
          unitPriv,
          base,
          privacyIds,
          privacyCount: privacyIds.length,
          privacyTotal,
          estRefund,
          total,
        };
      });

      const legTotal = paxRows.reduce((s, r) => s + r.total, 0);

      return {
        key: leg.key,
        flightNo:
          leg.flightNo || `${leg.origin || ""}-${leg.destination || ""}`,
        origin: leg.origin,
        destination: leg.destination,
        date: leg.date,
        paxRows,
        legTotal,
      };
    });
    // Recompute when current leg state changes so the cart stays live
  }, [booking, assignments, privacyBySeat, lang]);

  const grandTotalAllLegs = useMemo(
    () => legsCart.reduce((s, leg) => s + (leg.legTotal || 0), 0),
    [legsCart]
  );

  /* -------------------------------------------
   * Share / Email helpers
   * ------------------------------------------- */
  const buildCartShareText = useCallback(() => {
    // Compose a plain-text summary suitable for LINE or Email body
    const lines = [];
    lines.push(`${L.shareTitle}${bookingTitle ? ` — ${bookingTitle}` : ""}`);
    lines.push("");

    if (!legsCart.length) {
      lines.push(L.noData);
    } else {
      legsCart.forEach((leg) => {
        const legHeader = `${L.flight}: ${leg.flightNo}${
          leg.origin && leg.destination ? ` (${leg.origin}→${leg.destination})` : ""
        }${leg.date ? ` · ${leg.date}` : ""}`;
        lines.push(legHeader);

        leg.paxRows.forEach((r) => {
          const priv =
            r.privacyCount > 0
              ? `${L.privacy}: ${r.privacyCount} (${r.privacyIds.join(", ")}) × ${fmt(
                  r.unitPriv
                )} ${CURRENCY}`
              : `${L.privacy}: ${L.none}`;
          const row = `• ${r.name} — ${L.seat}: ${r.seat} | ${priv} | ${L.total}: ${fmt(
            r.total
          )} ${CURRENCY}`;
          lines.push(row);
        });

        lines.push(`${L.legTotal}: ${fmt(leg.legTotal)} ${CURRENCY}`);
        lines.push("");
      });

      lines.push(`${L.grandTotal}: ${fmt(grandTotalAllLegs)} ${CURRENCY}`);
    }
    return lines.join("\n");
  }, [legsCart, grandTotalAllLegs, L, bookingTitle]);

  const handleShareLine = useCallback(() => {
    const text = buildCartShareText();

    // Prefer LINE deep link (mobile), fallback to web share URL, then clipboard
    const lineApp = `line://msg/text/${encodeURIComponent(text)}`;
    const lineWeb = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;

    let opened = false;
    try {
      const w = window.open(lineApp, "_blank");
      opened = !!w;
    } catch {
      opened = false;
    }
    if (!opened) {
      try {
        const w2 = window.open(lineWeb, "_blank");
        opened = !!w2;
      } catch {
        opened = false;
      }
    }
    if (!opened && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert(L.shareCopyFallback);
      });
    }
  }, [buildCartShareText, L.shareCopyFallback]);

  const handleEmailCart = useCallback(() => {
    const subject = `${L.shareTitle}${bookingTitle ? ` — ${bookingTitle}` : ""}`;
    const body = buildCartShareText();
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body
    )}`;
    // Use open instead of location to avoid navigation loss
    window.open(mailto, "_blank");
  }, [buildCartShareText, L.shareTitle, bookingTitle]);

  /* -------------------------------------------
   * Checkout handlers
   * ------------------------------------------- */
  const openPayment = () => setShowPaymentModal(true);
  const closePayment = () => setShowPaymentModal(false);
  const handlePayNow = () => {
    alert(
      `${L.checkout} - ${
        paymentMethod === "card" ? L.creditCard : paymentMethod === "bank" ? L.bankTransfer : L.qrCode
      }\n${L.grandTotal}: ${fmt(grandTotalAllLegs)} ${CURRENCY}\n\n(Demo only)`
    );
    setShowPaymentModal(false);
  };

  /* -------------------------------------------
   * Render
   * ------------------------------------------- */
  return (
    <div
      className="min-h-screen p-3 sm:p-4"
      style={{ backgroundColor: THEME.bg50 }}
    >
      <TopBar
        lang={lang}
        onToggleLang={() => setLang((p) => (p === "EN" ? "TH" : "EN"))}
      />

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
                currentLeg.passengers.find((p) => p.id === selectedPassengerId)
                  ?.name || ""
              }
              currentSeat={currentSeat}
              zoneType={currentZone}
              basePriceTHB={baseSeatPriceTHB}
              privacyCount={privacyCountForPax}
              unitPrivacyFeeTHB={unitPrivacyFeeTHB}
              privacySeatIds={privacySeatIdsForCurrentPax}
            />

            {/* Control bar */}
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
                setAssignments((prev) => ({
                  ...prev,
                  [selectedPassengerId]: "",
                }));
                clearAllPrivacyOfOwner(selectedPassengerId);
                setSelectedSeat(null);
                setSavedFlag(false);
              }}
              handleClearAll={() => {
                if (
                  !window.confirm(
                    "Clear all local assignments & privacy for this flight?"
                  )
                )
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

            {/* Passenger list */}
            <PassengerList
              passengers={currentLeg.passengers}
              assignments={assignments}
              selectedPassengerId={selectedPassengerId}
              noneLabel={t.none}
            />

            {/* Privacy controls */}
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

            {/* Fare summary */}
            <FareSummary
              t={t}
              basePriceTHB={baseSeatPriceTHB}
              privacyCount={privacyCountForPax}
              unitPrivacyFeeTHB={unitPrivacyFeeTHB}
            />

            {/* 🛒 Shopping Cart (ALL passengers • by flight) UNDER PRICE SUMMARY */}
            <div className="mt-4">
              <Collapse
                open={showCart}
                onToggle={() => setShowCart((p) => !p)}
                summary={L.cartTitle}
              >
                <div
                  className="rounded-xl p-3 md:p-4 border bg-sky-50 text-[80%]"
                  style={{ borderColor: THEME.outline }}
                >
                  {!legsCart.length && (
                    <div className="opacity-70">{L.noData}</div>
                  )}

                  {legsCart.map((leg) => (
                    <div
                      key={leg.key}
                      className="mt-3 pt-3 border-t"
                      style={{ borderColor: THEME.outline }}
                    >
                      <div className="font-semibold">
                        {L.flight}: {leg.flightNo}{" "}
                        {leg.origin && leg.destination
                          ? `(${leg.origin}→${leg.destination})`
                          : ""}{" "}
                        {leg.date ? `· ${leg.date}` : ""}
                      </div>

                      <div className="mt-2 space-y-1.5">
                        {leg.paxRows.map((r) => (
                          <div key={r.paxId} className="text-blue-900">
                            <span className="font-medium">{r.name}</span>
                            {" · "}
                            <span>
                              {L.seat}: <span className="font-medium">{r.seat}</span>
                            </span>
                            {" | "}
                            <span>
                              {L.privacy}:{" "}
                              {r.privacyCount > 0
                                ? `${r.privacyCount} (${r.privacyIds.join(
                                    ", "
                                  )}) × ${fmt(r.unitPriv)} ${CURRENCY}`
                                : L.none}
                            </span>
                            {" | "}
                            <span>
                              {L.total}:{" "}
                              <span className="font-semibold">
                                {fmt(r.total)} {CURRENCY}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 font-semibold text-right">
                        {L.legTotal}: {fmt(leg.legTotal)} {CURRENCY}
                      </div>
                    </div>
                  ))}

                  {/* GRAND TOTAL */}
                  <div
                    className="mt-4 pt-3 border-t flex items-center justify-between"
                    style={{ borderColor: THEME.outline }}
                  >
                    <span className="font-semibold">{L.grandTotal}</span>
                    <span className="font-semibold">
                      {fmt(grandTotalAllLegs)} {CURRENCY}
                    </span>
                  </div>

                  {/* Action buttons under total */}
                  <div className="mt-3 flex flex-wrap gap-2 justify-end">
                 

                    <button
                      type="button"
                      onClick={openPayment}
                      className="px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {L.continuePayment}
                    </button>

                    <button
                      type="button"
                      onClick={handleShareLine}
                      className="px-3 py-1.5 rounded-lg text-white bg-green-500 hover:bg-green-600"
                      title="Share via LINE"
                    >
                      💬 {L.shareLine}
                    </button>

                    <button
                      type="button"
                      onClick={handleEmailCart}
                      className="px-3 py-1.5 rounded-lg border bg-nokYellow-400  hover:bg-gray-50"
                      style={{ borderColor: THEME.outline }}
                      title="Send by Email"
                    >
                      ✉️ {L.emailCart}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCart(false)}
                      className="px-3 py-1.5 rounded-lg border bg-skyBlue-200 hover:bg-gray-50"
                      style={{ borderColor: THEME.outline }}
                    >
                      {L.closeCart}
                    </button>
                  </div>
                </div>
              </Collapse>
            </div>
            {/* END: 🛒 Shopping Cart */}
          </div>
        </div>

        {/* RIGHT PANEL — SeatMap unchanged and always visible */}
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

      {/* Checkout Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closePayment}
          />
          {/* dialog */}
          <div className="relative z-10 w-[92%] max-w-xl rounded-2xl bg-white border shadow-xl">
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: THEME.outline }}
            >
              <div className="text-lg font-semibold">{L.checkout}</div>
              <button
                onClick={closePayment}
                className="px-2 py-1 rounded-lg border bg-white hover:bg-gray-50 text-sm"
                style={{ borderColor: THEME.outline }}
              >
                {L.cancel}
              </button>
            </div>

            <div className="p-5">
              {/* Total */}
              <div className="mb-3 text-sm">
                <span className="opacity-70">{L.grandTotal}: </span>
                <span className="font-semibold">
                  {fmt(grandTotalAllLegs)} {CURRENCY}
                </span>
              </div>

              {/* Method selector */}
              <div className="text-sm font-medium mb-2">{L.paymentMethod}</div>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`px-3 py-1.5 rounded-lg border ${
                    paymentMethod === "card" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                  }`}
                  style={{ borderColor: THEME.outline }}
                >
                  {L.creditCard}
                </button>
                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`px-3 py-1.5 rounded-lg border ${
                    paymentMethod === "bank" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                  }`}
                  style={{ borderColor: THEME.outline }}
                >
                  {L.bankTransfer}
                </button>
                <button
                  onClick={() => setPaymentMethod("qr")}
                  className={`px-3 py-1.5 rounded-lg border ${
                    paymentMethod === "qr" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                  }`}
                  style={{ borderColor: THEME.outline }}
                >
                  {L.qrCode}
                </button>
              </div>

              {/* Method-specific content */}
              {paymentMethod === "card" && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm opacity-80">{L.cardNumber}</label>
                    <input
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      style={{ borderColor: THEME.outline }}
                    />
                  </div>
                  <div>
                    <label className="text-sm opacity-80">{L.nameOnCard}</label>
                    <input
                      type="text"
                      placeholder="JOHN SMITH"
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      style={{ borderColor: THEME.outline }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm opacity-80">{L.expiry}</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="mt-1 w-full border rounded-lg px-3 py-2"
                        style={{ borderColor: THEME.outline }}
                      />
                    </div>
                    <div>
                      <label className="text-sm opacity-80">{L.cvv}</label>
                      <input
                        type="password"
                        placeholder="123"
                        className="mt-1 w-full border rounded-lg px-3 py-2"
                        style={{ borderColor: THEME.outline }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm opacity-80">{L.bank}</label>
                    <input
                      type="text"
                      placeholder="Your Bank Name"
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      style={{ borderColor: THEME.outline }}
                    />
                  </div>
                  <div>
                    <label className="text-sm opacity-80">{L.accountNo}</label>
                    <input
                      type="text"
                      placeholder="XXX-X-XXXXX-X"
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      style={{ borderColor: THEME.outline }}
                    />
                  </div>
                  <div>
                    <label className="text-sm opacity-80">{L.reference}</label>
                    <input
                      type="text"
                      placeholder="#REF-123456"
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      style={{ borderColor: THEME.outline }}
                    />
                  </div>
                  <div>
                    <label className="text-sm opacity-80">{L.uploadSlip}</label>
                    <input
                      type="file"
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      style={{ borderColor: THEME.outline }}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "qr" && (
                <div className="flex items-center gap-4">
                  <div className="w-40 h-40 bg-white border grid place-content-center rounded-lg"
                       style={{ borderColor: THEME.outline }}>
                    {/* Simple QR placeholder */}
                    <div className="w-28 h-28 bg-gray-200 grid grid-cols-5 grid-rows-5 gap-1 p-2">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={i % 2 ? "bg-gray-400" : "bg-white"}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm opacity-80">{L.qrNote}</div>
                </div>
              )}

              {/* Footer buttons */}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm"
                  style={{ borderColor: THEME.outline }}
                  onClick={closePayment}
                >
                  {L.cancel}
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-blue-100 bg-skyBlue-100 hover:bg-blue-700 text-sm"
                  onClick={handlePayNow}
                >
                  {L.payNow}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* END: Checkout Modal */}
    </div>
  );
}
