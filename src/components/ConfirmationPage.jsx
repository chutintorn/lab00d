import React, { useMemo, useState } from "react";

export default function ConfirmationPage() {
  // --- Constants / starter data ---
  const NOK_YELLOW = "#fdb900";
  const SPS_PRICE = 150;
  const BASE_GRAND_TOTAL = 2158.0; // from your original HTML example
  const AVAILABLE_SPS_SEATS = ["6A", "6B"];

  // --- UI state ---
  const [showModal, setShowModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [confirmedSeats, setConfirmedSeats] = useState([]);

  // --- Derived values ---
  const spsQty = confirmedSeats.length;
  const spsTotal = confirmedSeats.length * SPS_PRICE;
  const grandTotal = useMemo(() => BASE_GRAND_TOTAL + spsTotal, [spsTotal]);

  // --- Helpers ---
  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const formatTHB = (n) =>
    "THB " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleOpenModal = () => {
    if (selectedSeats.length === 0 && confirmedSeats.length > 0) {
      setSelectedSeats(confirmedSeats);
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    setConfirmedSeats([...selectedSeats]);
    setShowModal(false);
  };

  const handleCancel = () => setShowModal(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header / Brand band */}
        <div
          className="rounded-t-xl px-5 py-4 text-gray-900 font-bold flex items-center justify-between"
          style={{ backgroundColor: NOK_YELLOW }}
        >
          <div>
            <div className="text-sm font-semibold opacity-90">Booking Reference</div>
            <div className="text-lg font-extrabold">QIYR09 / 74331273</div>
          </div>
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-bold">
            Nok X-tra (Recommended!)
          </div>
        </div>

        <div className="rounded-b-xl border border-gray-200 bg-white shadow-sm">
          {/* Flight */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">✈️ Flight</h3>
            <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-4">
              <div>
                <div className="font-extrabold">
                  Bangkok (Don Mueang) [DMK] → Chiang Mai [CNX]
                </div>
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
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">👤 Passenger Information</h3>
            <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
              <RowItem label="Passenger Name" value="MR CHUTINTORN SRISITTIKUM" />
              <RowItem label="Type" value="Adult" />
              <RowItem label="Date of Birth" value="04-Dec-1961" />
              <RowItem label="Phone" value="+66863623055" />
              <RowItem label="Email" value="CHUTINTORN.SRI@NOKAIR.COM" />
            </div>
          </section>

          {/* Ancillaries */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">🧾 Additional Services</h3>
            <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
              <RowItem label="Passenger" value="MR CHUTINTORN SRISITTIKUM" />
              <RowItem label="Segment" value="Outbound • Bangkok (Don Mueang) → Chiang Mai" />
              <RowItem label="Services" value="1 × Nok Protect Travel Insurance" />
              <RowItem label="" value="1 × Nok X-Tra" />
              <RowItem label="" value="1 × Nok Premium Seat" />
              <RowItem label="" value="1 × 15 kg included Baggage" />
              <RowItem label="" value="1 × Payment Fee" />
            </div>
          </section>

          {/* Seats Table */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">💺 Seat</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 font-semibold">
                  <th className="border-b border-gray-200 p-2 text-left">Passenger</th>
                  <th className="border-b border-gray-200 p-2 text-left">Flight</th>
                  <th className="border-b border-gray-200 p-2 text-left">Seat</th>
                </tr>
              </thead>
              <tbody>
                {/* Base seat row */}
                <tr>
                  <td className="border-b border-gray-200 p-2">MR CHUTINTORN SRISITTIKUM</td>
                  <td className="border-b border-gray-200 p-2">
                    Outbound • Bangkok (DMK) – Chiang Mai
                  </td>
                  <td className="border-b border-gray-200 p-2">6C</td>
                </tr>

                {/* Dynamically appended SPS rows */}
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

          {/* SPS Offer */}
          <section className="border-t border-gray-200 p-5">
            <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
              <h3 className="mb-3 text-base font-bold">🪑 Standby Privacy Seat Offer</h3>
              <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
                <RowItem label="Passenger" value="MR CHUTINTORN SRISITTIKUM" />
                <RowItem label="Available Seats" value="6A and 6B" />
                <div className="flex items-center gap-2">
                  <div className="w-40 text-gray-600">Select Seats</div>
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
                <RowItem label="Price" value="THB 150 per seat" />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleOpenModal}
                  className="rounded-lg border border-yellow-400 bg-yellow-300/80 px-4 py-2 font-extrabold text-gray-900 hover:bg-yellow-300"
                >
                  Purchase Standby Privacy Seat
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Selected: {selectedSeats.length ? selectedSeats.join(", ") : "—"}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="border-t border-gray-200 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">💳 Payment Details</h3>

            <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
              {/* Fare table */}
              <div>
                <Table
                  title="Fare"
                  rows={[
                    {
                      cells: [
                        "One-way ticket — Nok X-tra (Recommended!) — Adult",
                        "1",
                        "1,447.66",
                      ],
                    },
                    { isSubtotal: true, cells: ["Subtotal", "", "THB 1,447.66"] },
                  ]}
                />
              </div>

              {/* Fee table */}
              <div>
                <Table
                  title="Service / Fee"
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
              {/* Taxes */}
              <div>
                <Table
                  title="Taxes / Airport Fees"
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
              {/* SPS table */}
              <div>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 font-semibold">
                      <th className="border-b border-gray-200 p-2 text-left">Item</th>
                      <th className="border-b border-gray-200 p-2 text-left">Qty</th>
                      <th className="border-b border-gray-200 p-2 text-right">Total (THB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-gray-200 p-2 text-gray-600">
                        Standby Privacy Seat
                      </td>
                      <td className="border-b border-gray-200 p-2">{spsQty}</td>
                      <td className="border-b border-gray-200 p-2 text-right">
                        {spsTotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div />
            </div>

            <div className="mt-2 flex items-center justify-end gap-3 text-lg font-extrabold">
              <span>Grand Total</span>
              <span>{formatTHB(grandTotal)}</span>
            </div>
          </section>

          {/* Actions */}
          <section className="border-t border-gray-200 p-5">
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-bold"
                onClick={() => window.print()}
              >
                Print Confirmation
              </button>
              <button className="rounded-lg border border-gray-200 bg-green-50 px-3 py-2 font-bold">
                Print Receipt
              </button>
              <button className="rounded-lg border border-gray-200 bg-green-50 px-3 py-2 font-bold">
                Send Confirmation Email
              </button>
              <button className="rounded-lg border border-gray-200 bg-green-50 px-3 py-2 font-bold">
                Manage Booking
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-[92%] max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-4 py-3 font-extrabold">
              Select Standby Privacy Seat
            </div>
            <div className="px-4 py-4">
              <div className="font-semibold">Choose seat(s):</div>
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
                <span>Price</span>
                <span>THB 150 / seat</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-lg font-extrabold">
                <span>Total</span>
                <span>
                  THB {(selectedSeats.length * SPS_PRICE).toLocaleString("en-US")}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <button
                onClick={handleCancel}
                className="rounded-lg bg-gray-100 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-lg border border-yellow-400 bg-yellow-300 px-4 py-2 font-extrabold text-gray-900 hover:bg-yellow-300"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Small helpers --------------------------- */

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
