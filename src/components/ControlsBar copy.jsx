// src/components/ControlsBar.jsx
import React, { useEffect } from "react";
import { THEME } from "../config/theme";
import LegendItem from "./LegendItem";
import LegendItemPrivacy from "./LegendItemPrivacy";
import { ZONE_PRICE_THB, CURRENCY } from "../utils/pricingConstants";

export default function ControlsBar({
  t, lang, setLang, booking, legIndex, setLegIndex,
  selectedPassengerId, setSelectedPassengerId,
  selectedSeat, setSelectedSeat,
  assignments, handleBook, handleSaveLocal, handleResetToFile, handleCancel, handleClearAll,
  savedFlag,

  // price overlay toggle
  showPrices,
  onToggleShowPrices,
}) {
  const legs = booking?.legs || [];
  const currentLeg = legs[legIndex] || legs[0] || { passengers: [] };
  const passengers = currentLeg.passengers || [];

  // ensure current passenger is valid when flight changes
  useEffect(() => {
    const exists = passengers.some(p => String(p.id) === String(selectedPassengerId));
    if (!exists) {
      setSelectedPassengerId(passengers[0]?.id ?? "");
      setSelectedSeat(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legIndex, booking?.legs]);

  const onChangeLeg = (e) => {
    const idx = Number(e.target.value);
    setLegIndex(idx);
    setSelectedSeat(null);
  };

  return (
    <div
      className="bg-white border rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
      style={{ borderColor: THEME.outline }}
    >
      {/* 0) Top row: language + show prices toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Language</span>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            style={{ borderColor: THEME.outline }}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            <option value="EN">EN</option>
            <option value="TH">TH</option>
          </select>
        </div>

        {/* Toggle switch — replaces the old checkbox */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            role="switch"
            aria-checked={!!showPrices}
            onClick={onToggleShowPrices}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition
              ${showPrices ? "bg-emerald-500" : "bg-gray-300"}`}
            title="Show prices on seat map"
          >
            <span className="sr-only">Show prices on seat map</span>
            <span
              className={`inline-block h-5 w-5 transform bg-white rounded-full transition
                ${showPrices ? "translate-x-5" : "translate-x-1"}`}
            />
          </button>
          <span className="text-sm select-none">Show prices on seat map</span>
        </div>
      </div>

      {/* 1) Flight (Leg) selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">{t.legLabel}</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          style={{ borderColor: THEME.outline }}
          value={Math.min(legIndex ?? 0, Math.max(legs.length - 1, 0))}
          onChange={onChangeLeg}
        >
          {legs.map((leg, i) => (
            <option key={leg.key ?? i} value={i}>
              {leg.title}
            </option>
          ))}
        </select>
      </div>

      {/* 2) Legend (with zone prices) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <LegendItem
          color={THEME.frontPremium}
          label={`${t.legend.fp} (${ZONE_PRICE_THB.frontPremium} ${CURRENCY})`}
        />
        <LegendItem
          color={THEME.premium}
          label={`${t.legend.p} (${ZONE_PRICE_THB.premium} ${CURRENCY})`}
        />
        <LegendItem
          color={THEME.happy}
          label={`${t.legend.h} (${ZONE_PRICE_THB.happy} ${CURRENCY})`}
        />
        <LegendItem color={THEME.booked} label={t.legend.b} />
        <LegendItem color={THEME.selected} label={t.legend.s} />
        {/* Show privacy without a fixed fee here since fee varies by zone */}
        <LegendItemPrivacy label={`${t.legend.pr} (zone-based)`} />
      </div>

      {/* 3) Passenger selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">{t.passengerLabel}</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          style={{ borderColor: THEME.outline }}
          value={selectedPassengerId ?? ""}
          onChange={(e) => setSelectedPassengerId(e.target.value)}
        >
          {passengers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* 4) Selected seat line */}
      <div className="mt-1 font-bold">
        {t.selectedSeat}:{" "}
        <span className={selectedSeat ? "text-gray-900" : "text-gray-400"}>
          {selectedSeat || t.none}
        </span>
      </div>

      {/* 5) Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Book */}
        <button
          onClick={handleBook}
          disabled={!selectedPassengerId || !selectedSeat}
          className={`px-4 py-2 rounded-lg border font-semibold ${
            selectedPassengerId && selectedSeat
              ? "bg-emerald-500 text-white hover:opacity-90"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          style={{ borderColor: THEME.outline }}
        >
          {t.book}
        </button>

        {/* Clear selection */}
        <button
          onClick={() => setSelectedSeat(null)}
          disabled={!selectedSeat}
          className={`px-4 py-2 rounded-lg border font-semibold ${
            selectedSeat
              ? "bg-blue-600 text-white hover:opacity-90"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          style={{ borderColor: THEME.outline }}
        >
          {t.clearSelection}
        </button>

        {/* Save local */}
        <button
          onClick={handleSaveLocal}
          className="px-4 py-2 rounded-lg border font-semibold bg-emerald-400 text-white hover:bg-emerald-500"
          style={{ borderColor: THEME.outline }}
        >
          Save Selection
        </button>

        {/* Reset to file */}
        <button
          onClick={handleResetToFile}
          className="px-4 py-2 rounded-lg border font-semibold bg-white hover:bg-gray-50"
          style={{ borderColor: THEME.outline }}
        >
          {t.resetToFile}
        </button>

        {/* Cancel booking */}
        <button
          onClick={handleCancel}
          disabled={!selectedPassengerId || !assignments[selectedPassengerId]}
          className={`px-4 py-2 rounded-lg border font-semibold ${
            selectedPassengerId && assignments[selectedPassengerId]
              ? "bg-rose-500 text-white hover:opacity-90"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          style={{ borderColor: THEME.outline }}
        >
          {t.cancel}
        </button>

        {/* Clear all */}
        <button
          onClick={handleClearAll}
          className="px-4 py-2 rounded-lg border font-semibold bg-white hover:bg-gray-50"
          style={{ borderColor: THEME.outline }}
        >
          {t.clearAll}
        </button>

        {/* Save status */}
        <span className="text-xs text-gray-500 ml-1 block">
          {t.savedHint}{" "}
          {savedFlag && (
            <span className="ml-2 text-emerald-600 font-semibold">
              {t.savedTick}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
