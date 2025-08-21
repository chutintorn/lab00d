import React, { useMemo, useState } from "react";

/**
 * ConfirmationPage
 * - Preserves all existing UI and i18n
 * - Fixes Manage Booking "Continue" to navigate to Booking Page (Seat + Privacy) in same tab
 * - Optional prop: onNavigateToBooking() from parent; otherwise uses DOM/hash fallbacks
 */
export default function ConfirmationPage({ onNavigateToBooking }) {
  // ---- Brand + config ----
  const NOK_YELLOW = "#fdb900";
  const SPS_PRICE = 150;
  const BASE_GRAND_TOTAL = 2158.0;
  const AVAILABLE_SPS_SEATS = ["6A", "6B"];

  // 👉 replace with your real booking URL (keep the query keys if you like)
  const MANAGE_BOOKING_URL = "https://example.com/booking/manage";

  // ---- i18n ----
  const [lang, setLang] = useState("en");
  const TEXT = {
    en: {
      bookingRef: "Booking Reference",
      badge: "Nok X-tra (Recommended!)",
      flight: "Flight",
      flightLine: "Bangkok (Don Mueang) [DMK] → Chiang Mai [CNX]",
      passengerInfo: "Passenger Information",
      additional: "Additional Services",
      seat: "Seat",
      spsOffer: "Standby Privacy Seat Offer",
      passenger: "Passenger",
      availableSeats: "Available Seats",
      selectSeats: "Select Seats",
      price: "Price",
      pricePerSeat: "THB 150 per seat",
      selected: "Selected",
      purchaseSPS: "Purchase Standby Privacy Seat",
      cancelPurchase: "Cancel Purchase",
      payment: "Payment Details",
      fare: "Fare",
      fee: "Service / Fee",
      taxes: "Taxes / Airport Fees",
      item: "Item",
      qty: "Qty",
      totalThb: "Total (THB)",
      grandTotal: "Grand Total",
      printConf: "Print Confirmation",
      printReceipt: "Print Receipt",
      sendEmail: "Send Confirmation Email",
      manageBooking: "Manage Booking",
      managePrivacy: "Manage Privacy",
      spsTitle: "Select Standby Privacy Seat",
      spsTotal: "Total",
      confirm: "Confirm Purchase",
      cancel: "Cancel",
      mpTitle: "Manage Booking",
      mpRef: "Booking reference",
      mpLast: "Last name",
      mpContinue: "Continue",
      langLabel: "Language",
      en: "EN",
      th: "TH",
    },
    th: {
      bookingRef: "หมายเลขการจอง",
      badge: "นก เอ็กซ์ตร้า (แนะนำ!)",
      flight: "เที่ยวบิน",
      flightLine: "กรุงเทพฯ (ดอนเมือง) [DMK] → เชียงใหม่ [CNX]",
      passengerInfo: "ข้อมูลผู้โดยสาร",
      additional: "บริการเพิ่มเติม",
      seat: "ที่นั่ง",
      spsOffer: "ข้อเสนอที่นั่งส่วนตัวแบบสแตนด์บาย",
      passenger: "ผู้โดยสาร",
      availableSeats: "ที่นั่งที่มี",
      selectSeats: "เลือกที่นั่ง",
      price: "ราคา",
      pricePerSeat: "150 บาท / ที่นั่ง",
      selected: "เลือกแล้ว",
      purchaseSPS: "ซื้อที่นั่งส่วนตัวแบบสแตนด์บาย",
      cancelPurchase: "ยกเลิกการซื้อ",
      payment: "รายละเอียดการชำระเงิน",
      fare: "ค่าโดยสาร",
      fee: "ค่าบริการ / ค่าธรรมเนียม",
      taxes: "ภาษี / ค่าธรรมเนียมสนามบิน",
      item: "รายการ",
      qty: "จำนวน",
      totalThb: "รวม (บาท)",
      grandTotal: "ยอดรวมทั้งหมด",
      printConf: "พิมพ์ใบยืนยัน",
      printReceipt: "พิมพ์ใบเสร็จ",
      sendEmail: "ส่งอีเมลยืนยัน",
      manageBooking: "จัดการบุ๊กกิ้ง",
      managePrivacy: "จัดการความเป็นส่วนตัว",
      spsTitle: "เลือกที่นั่งส่วนตัวแบบสแตนด์บาย",
      spsTotal: "รวม",
      confirm: "ยืนยันการซื้อ",
      cancel: "ยกเลิก",
      mpTitle: "จัดการบุ๊กกิ้ง",
      mpRef: "หมายเลขการจอง",
      mpLast: "นามสกุล",
      mpContinue: "ดำเนินการต่อ",
      langLabel: "ภาษา",
      en: "EN",
      th: "TH",
    },
  };
  const t = (k) => (TEXT[lang] && TEXT[lang][k]) || k;

  // ---- UI state ----
  const [showModal, setShowModal] = useState(false); // SPS modal
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [confirmedSeats, setConfirmedSeats] = useState([]);

  // Manage Privacy modal
  const [showManage, setShowManage] = useState(false);
  const [mpRef, setMpRef] = useState("");
  const [mpLastName, setMpLastName] = useState("");

  // ---- Derived ----
  const spsQty = confirmedSeats.length;
  const spsTotal = confirmedSeats.length * SPS_PRICE;
  const grandTotal = useMemo(() => BASE_GRAND_TOTAL + spsTotal, [spsTotal]);

  // ---- Helpers ----
  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const formatTHB = (n) =>
    "THB " +
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleOpenModal = () => {
    if (selectedSeats.length === 0 && confirmedSeats.length > 0) {
      setSelectedSeats(confirmedSeats);
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      alert(lang === "th" ? "กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง" : "Please select at least one seat.");
      return;
    }
    setConfirmedSeats([...selectedSeats]);
    setShowModal(false);
  };

  const handleCancel = () => setShowModal(false);

  const handleCancelPurchase = () => {
    if (confirmedSeats.length === 0) return;
    const ok = window.confirm(
      (lang === "th" ? "ยกเลิกที่นั่ง" : "Cancel seats") + ` ${confirmedSeats.join(", ")} ?`
    );
    if (!ok) return;
    setConfirmedSeats([]);
    setSelectedSeats([]);
  };

  // --------- NEW: Safe navigate-to-booking helpers ----------
  const goToBookingPage = () => {
    // 1) Use parent prop if provided (ideal; no reload)
    if (typeof onNavigateToBooking === "function") {
      try {
        onNavigateToBooking();
        return;
      } catch {}
    }

    // 2) Try to click a tab button marked for booking
    const byDataAttr = document.querySelector('button[data-tab="booking"]');
    if (byDataAttr) {
      byDataAttr.click();
      return;
    }

    // 3) Try to find a button whose text contains "booking"
    const btns = Array.from(document.querySelectorAll("button"));
    const byText = btns.find((b) => /booking/i.test(b.textContent || ""));
    if (byText) {
      byText.click();
      return;
    }

    // 4) Fallback: set a hash for your App to react to (same tab)
    window.location.hash = "#booking";
    // (Optional, not recommended): force reload if your App reads on initial mount
    // window.location.reload();
  };

  // Manage Privacy modal open/close
  const openManage = () => setShowManage(true);
  const closeManage = () => setShowManage(false);

  // --------- CHANGED: this used to open a new tab; now it navigates within the app ----------
  const handleManageSubmit = () => {
    // Keep the URL composition (handy if you still use it later)
    const url =
      `${MANAGE_BOOKING_URL}?ref=` +
      encodeURIComponent(mpRef || "QIYR09") +
      `&ln=` +
      encodeURIComponent(mpLastName || "SRISITTIKUM");

    // Save for potential prefill on Booking page
    try {
      sessionStorage.setItem(
        "manageBookingPrefill",
        JSON.stringify({ ref: mpRef || "QIYR09", ln: mpLastName || "SRISITTIKUM", url })
      );
    } catch {}

    // Close modal then navigate to Booking Page (Seat + Privacy) in same tab
    setShowManage(false);
    goToBookingPage();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header / Brand */}
        <div
          className="rounded-t-xl px-5 py-4 text-gray-900 font-bold flex items-center justify-between"
          style={{ backgroundColor: NOK_YELLOW }}
        >
          <div>
            <div className="text-sm font-semibold opacity-90">{t("bookingRef")}</div>
            <div className="text-lg font-extrabold">QIYR09 / 74331273</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-bold">
              {t("badge")}
            </div>
            {/* Language toggle */}
            <div className="inline-flex rounded-full border border-gray-200 bg-white">
              <button
                className={`px-3 py-1 text-sm font-bold rounded-l-full ${
                  lang === "en" ? "bg-gray-900 text-white" : "text-gray-700"
                }`}
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
              >
                {t("en")}
              </button>
              <button
                className={`px-3 py-1 text-sm font-bold rounded-r-full ${
                  lang === "th" ? "bg-gray-900 text-white" : "text-gray-700"
                }`}
                onClick={() => setLang("th")}
                aria-pressed={lang === "th"}
              >
                {t("th")}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-b-xl border border-gray-200 bg-white shadow-sm">
          {/* Flight */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">✈️ {t("flight")}</h3>
            <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-4">
              <div>
                <div className="font-extrabold">{t("flightLine")}</div>
                <div className="text-gray-600">Thursday, 21 August 2025</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-lg font-extrabold">06:30 – 07:40</div>
                <div className="text-gray-600">Direct • 1h 10m • DD 120 • B737-800</div>
              </div>
            </div>
          </section>

          {/* Passenger */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">👤 {t("passengerInfo")}</h3>
            <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
              <RowItem label="Passenger Name" value="MR CHUTINTORN SRISITTIKUM" />
              <RowItem label="Type" value="Adult" />
              <RowItem label="Date of Birth" value="04-Dec-1961" />
              <RowItem label="Phone" value="+66863623055" />
              <RowItem label="Email" value="CHUTINTORN.SRI@NOKAIR.COM" />
            </div>
          </section>

          {/* Additional */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">🧾 {t("additional")}</h3>
            <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
              <RowItem label={t("passenger")} value="MR CHUTINTORN SRISITTIKUM" />
              <RowItem label="Segment" value="Outbound • Bangkok (DMK) → Chiang Mai" />
              <RowItem label="Services" value="1 × Nok Protect Travel Insurance" />
              <RowItem label="" value="1 × Nok X-Tra" />
              <RowItem label="" value="1 × Nok Premium Seat" />
              <RowItem label="" value="1 × 15 kg included Baggage" />
              <RowItem label="" value="1 × Payment Fee" />
            </div>
          </section>

          {/* Seats table */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">💺 {t("seat")}</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 font-semibold">
                  <th className="border-b border-gray-200 p-2 text-left">{t("passenger")}</th>
                  <th className="border-b border-gray-200 p-2 text-left">{t("flight")}</th>
                  <th className="border-b border-gray-200 p-2 text-left">Seat</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-gray-200 p-2">MR CHUTINTORN SRISITTIKUM</td>
                  <td className="border-b border-gray-200 p-2">Outbound • Bangkok (DMK) – Chiang Mai</td>
                  <td className="border-b border-gray-200 p-2">6C</td>
                </tr>
                {confirmedSeats.map((seat) => (
                  <tr key={seat} data-sps="1">
                    <td className="border-b border-gray-200 p-2">MR CHUTINTORN SRISITTIKUM</td>
                    <td className="border-b border-gray-200 p-2">
                      Outbound • Bangkok (DMK) – Chiang Mai — Standby Privacy Seat
                    </td>
                    <td className="border-b border-gray-200 p-2">{seat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* SPS offer */}
          <section className="border-t border-gray-200 p-5">
            <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
              <h3 className="mb-3 text-base font-bold">🪑 {t("spsOffer")}</h3>
              <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
                <RowItem label={t("passenger")} value="MR CHUTINTORN SRISITTIKUM" />
                <RowItem label={t("availableSeats")} value="6A and 6B" />
                <div className="flex items-center gap-2">
                  <div className="w-40 text-gray-600">{t("selectSeats")}</div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SPS_SEATS.map((s) => {
                      const active = selectedSeats.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleSeat(s)}
                          className={[
                            "rounded-lg border-2 px-3 py-1 text-sm font-extrabold",
                            active
                              ? "border-sky-400 bg-sky-100"
                              : "border-sky-400 bg-white hover:bg-sky-50",
                          ].join(" ")}
                          aria-pressed={active}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <RowItem label={t("price")} value={t("pricePerSeat")} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleOpenModal}
                  className="rounded-lg border border-yellow-400 bg-yellow-300/80 px-4 py-2 font-extrabold text-gray-900 hover:bg-yellow-300"
                >
                  {t("purchaseSPS")}
                </button>

                <button
                  onClick={handleCancelPurchase}
                  disabled={confirmedSeats.length === 0}
                  className={[
                    "rounded-lg border px-4 py-2 font-bold",
                    confirmedSeats.length === 0
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
                  ].join(" ")}
                  title={confirmedSeats.length === 0 ? "No privacy seats purchased yet" : t("cancelPurchase")}
                >
                  {t("cancelPurchase")}
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                {t("selected")}: {selectedSeats.length ? selectedSeats.join(", ") : "—"}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">💳 {t("payment")}</h3>

            <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
              <div>
                <Table
                  title={t("fare")}
                  rows={[
                    { cells: ["One-way ticket — Nok X-tra (Recommended!) — Adult", "1", "1,447.66"] },
                    { isSubtotal: true, cells: ["Subtotal", "", "THB 1,447.66"] },
                  ]}
                />
              </div>
              <div>
                <Table
                  title={t("fee")}
                  rows={[
                    { cells: ["Nok Protect Travel Insurance", "1", "129.00"] },
                    { cells: ["Nok Premium Seat", "1", "327.10"] },
                    { cells: ["15 kg included Baggage", "1", "0.00"] },
                    { cells: ["Payment Fee", "1", "0.00"] },
                    { isSubtotal: true, cells: ["Subtotal", "", "THB 456.10"] },
                  ]}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
              <div>
                <Table
                  title={t("taxes")}
                  rows={[
                    { cells: ["VAT", "3", "22.90"] },
                    { cells: ["Payment Fee", "2", "Free"] },
                    { cells: ["AT: Airport Tax", "1", "130.00"] },
                    { cells: ["VAT", "1", "101.34"] },
                  ]}
                />
              </div>
              <div />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
              <div>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 font-semibold">
                      <th className="border-b border-gray-200 p-2 text-left">{t("item")}</th>
                      <th className="border-b border-gray-200 p-2 text-left">{t("qty")}</th>
                      <th className="border-b border-gray-200 p-2 text-right">{t("totalThb")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-gray-200 p-2 text-gray-600">Standby Privacy Seat</td>
                      <td className="border-b border-gray-200 p-2">{spsQty}</td>
                      <td className="border-b border-gray-200 p-2 text-right">
                        {spsTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div />
            </div>

            <div className="mt-2 flex items-center justify-end gap-3 text-lg font-extrabold">
              <span>{t("grandTotal")}</span>
              <span>{formatTHB(grandTotal)}</span>
            </div>
          </section>

          {/* Actions */}
          <section className="border-t border-gray-200 p-5">
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-bold" onClick={() => window.print()}>
                {t("printConf")}
              </button>
              <button className="rounded-lg border border-gray-200 bg-green-50 px-3 py-2 font-bold">
                {t("printReceipt")}
              </button>
              <button className="rounded-lg border border-gray-200 bg-green-50 px-3 py-2 font-bold">
                {t("sendEmail")}
              </button>
              <button className="rounded-lg border border-gray-200 bg-green-50 px-3 py-2 font-bold">
                {t("manageBooking")}
              </button>
              <button
                className="rounded-lg border border-sky-400 bg-green-50 px-3 py-2 font-bold"
                onClick={openManage}
                data-testid="manage-privacy-btn"
              >
                {t("managePrivacy")}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* SPS Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-[92%] max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-4 py-3 font-extrabold">{t("spsTitle")}</div>
            <div className="px-4 py-4">
              <div className="font-semibold">{t("selectSeats")}:</div>
              <div className="mt-3 flex flex-wrap gap-4">
                {AVAILABLE_SPS_SEATS.map((seat) => (
                  <label key={seat} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-yellow-500"
                      checked={selectedSeats.includes(seat)}
                      onChange={() => toggleSeat(seat)}
                    />
                    <span>{seat}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between font-semibold">
                <span>{t("price")}</span>
                <span>{t("pricePerSeat")}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-lg font-extrabold">
                <span>{t("spsTotal")}</span>
                <span>THB {(selectedSeats.length * SPS_PRICE).toLocaleString("en-US")}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <button
                onClick={handleCancel}
                className="rounded-lg bg-gray-100 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-200"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-lg border border-yellow-400 bg-yellow-300 px-4 py-2 font-extrabold text-gray-900 hover:bg-yellow-300"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Privacy Modal (i18n) */}
      {showManage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && closeManage()}
        >
          <div className="w-[92%] max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="font-extrabold">{t("mpTitle")}</h2>
              <button aria-label="Close" onClick={closeManage} className="text-2xl leading-none px-1">
                ×
              </button>
            </div>
            <form
              className="px-4 py-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleManageSubmit();
              }}
            >
              <label className="block">
                <span className="text-sm text-gray-700">
                  {t("mpRef")} <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  placeholder={lang === "th" ? "เช่น QIYR09" : "e.g., QIYR09"}
                  value={mpRef}
                  onChange={(e) => setMpRef(e.target.value)}
                  className="mt-1 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">
                  {t("mpLast")} <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  placeholder={lang === "th" ? "เช่น SRISITTIKUM" : "e.g., SRISITTIKUM"}
                  value={mpLastName}
                  onChange={(e) => setMpLastName(e.target.value)}
                  className="mt-1 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-lg font-bold text-gray-900 py-3"
                style={{ backgroundColor: NOK_YELLOW }}
                data-testid="manage-continue-btn"
              >
                {t("mpContinue")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* helpers */
function RowItem({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-44 shrink-0 text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Table({ title, rows }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100 font-semibold">
          <th className="border-b border-gray-200 p-2 text-left">{title}</th>
          <th className="border-b border-gray-200 p-2 text-left">Qty</th>
          <th className="border-b border-gray-200 p-2 text-right">Total (THB)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) =>
          r.isSubtotal ? (
            <tr key={idx} className="font-semibold">
              <td className="border-b border-gray-200 p-2" colSpan={2}>
                Subtotal
              </td>
              <td className="border-b border-gray-200 p-2 text-right">
                {Array.isArray(r.cells) ? r.cells[2] : r.cells}
              </td>
            </tr>
          ) : (
            <tr key={idx}>
              <td className="border-b border-gray-200 p-2">
                {Array.isArray(r.cells) ? r.cells[0] : r.cells}
              </td>
              <td className="border-b border-gray-200 p-2">
                {Array.isArray(r.cells) ? r.cells[1] : ""}
              </td>
              <td className="border-b border-gray-200 p-2 text-right">
                {Array.isArray(r.cells) ? r.cells[2] : ""}
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}
