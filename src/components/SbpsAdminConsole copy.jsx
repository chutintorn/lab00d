import React, { useMemo, useState } from "react";

const STEPS = [
  { n: 1, title: "Customer books His/Her Own Seat", body: "Customer selects a primary seat. This seat anchors the SBPS offer logic; neighbor seats become candidates for privacy blocks.", pill: { text: "Anchor", tone: "info" } },
  { n: 2, title: "IBE offers SBPS (blocks neighbors)", body: "IBE calculates a clear single price to block adjacent seats and guarantee privacy next to the anchor seat.", pill: { text: "SBPS Offer", tone: "default" } },
  { n: 3, title: "Payment handling", body: "Instant payment → Standby. Counter payment → Pending until confirmation.", pills: [{ text: "Counter = Pending", tone: "warn" }, { text: "Instant = Standby", tone: "info" }] },
  { n: 4, title: "Auto-recheck & triggers", body: "System rechecks eligibility every 6 hours and at payment time to finalize or convert SBPS states.", pill: { text: "⏱ Every 6h + payment", tone: "default" } },
  { n: 5, title: "Outcomes", body: "Purchased • Converted (refund + compensation) • Refunded • Cancelled", outcomes: [{ text: "Purchased", tone: "success" }, { text: "Converted", tone: "info" }, { text: "Refunded", tone: "warn" }, { text: "Cancelled", tone: "danger" }] },
  { n: 6, title: "Admin exceptions & outreach", body: "Backoffice reviews flagged cases, resolves edge scenarios, and communicates alternatives or compensation.", pill: { text: "Backoffice", tone: "default" } },
];

const DEMO_DATA = [
  { flight_id:"DD122-20251010-DMK-CNX", reservation_code:"ABC123", first_name:"Anukul", last_name:"Srisitti", sbps_seat_id:"12B", anchor_seat_id:"12A", impact_block_seats:"12A,12B,12C", marked_up_price:1100, deposit_amount:100, offer_expires_at:"2025-10-09 23:59:00", status:"pending", flight_status:"scheduled" },
  { flight_id:"DD122-20251010-DMK-CNX", reservation_code:"XYZ456", first_name:"Somchai", last_name:"Wongchai", sbps_seat_id:"12C", anchor_seat_id:"12A", impact_block_seats:"12A,12B,12C", marked_up_price:1150, deposit_amount:100, offer_expires_at:"2025-10-09 23:59:00", status:"standby", flight_status:"scheduled" },
  { flight_id:"DD155-20251012-DMK-HKT", reservation_code:"DEF789", first_name:"Malee", last_name:"Intanon", sbps_seat_id:"15B", anchor_seat_id:"15A", impact_block_seats:"15A,15B,15C", marked_up_price:1200, deposit_amount:100, offer_expires_at:"2025-10-11 23:59:00", status:"converted", flight_status:"scheduled" },
  { flight_id:"DD200-20251013-CNX-DMK", reservation_code:"LMN321", first_name:"Kittipong", last_name:"Chatchai", sbps_seat_id:"10A", anchor_seat_id:"10B", impact_block_seats:"10A,10B,10C", marked_up_price:900, deposit_amount:80, offer_expires_at:"2025-10-12 23:59:00", status:"refunded", flight_status:"scheduled" },
  { flight_id:"DD300-20251014-BKK-UTH", reservation_code:"QRS654", first_name:"Warunee", last_name:"Supaporn", sbps_seat_id:"9C", anchor_seat_id:"9A", impact_block_seats:"9A,9B,9C", marked_up_price:1000, deposit_amount:90, offer_expires_at:"2025-10-13 23:59:00", status:"purchased", flight_status:"scheduled" },
  { flight_id:"DD400-20251015-DMK-HDY", reservation_code:"TUV987", first_name:"Prasert", last_name:"Boonmee", sbps_seat_id:"14B", anchor_seat_id:"14A", impact_block_seats:"14A,14B,14C", marked_up_price:950, deposit_amount:100, offer_expires_at:"2025-10-14 23:59:00", status:"cancelled", flight_status:"cancelled" },
  { flight_id:"DD124-20251012-DMK-UTH", reservation_code:"ZZZ000", first_name:"Nok", last_name:"Air", sbps_seat_id:"20C", anchor_seat_id:"20A", impact_block_seats:"20A,20B,20C", marked_up_price:950, deposit_amount:90, offer_expires_at:"2025-10-11 23:30:00", status:"completed", flight_status:"departed" },
];

export default function SbpsAdminConsole() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [flightStatus, setFlightStatus] = useState("");
  const [rows] = useState(DEMO_DATA);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      const hay = `${r.flight_id} ${r.reservation_code} ${r.first_name} ${r.last_name}`.toLowerCase();
      const okQ = !q || hay.includes(q);
      const okS = !status || r.status === status;
      const okF = !aOrB(flightStatus, r.flight_status);
      return okQ && okS && okF;
    });
  }, [rows, query, status, flightStatus]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [method, setMethod] = useState("card");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState({ number:"", name:"", auth:"" });
  const [bank, setBank] = useState({ name:"", acct:"", holder:"" });
  const [voucher, setVoucher] = useState({ code:"", amt:"", exp:"" });

  const isRefundable = (s) => s === "converted" || s === "cancelled";

  function openRefund(row) {
    if (!isRefundable(row.status)) return;
    setActiveRow(row);
    setMethod("card");
    setEmail("");
    setCard({ number:"", name:"", auth:"" });
    setBank({ name:"", acct:"", holder:"" });
    setVoucher({ code:"", amt:"", exp:"" });
    setModalOpen(true);
  }
  function closeRefund() {
    setModalOpen(false);
    setActiveRow(null);
  }
  function onSubmitRefund(e) {
    e.preventDefault();
    if (!email) return alert("Please enter notify email.");
    if (method === "card" && !card.number) return alert("Please enter card number.");
    if (method === "bank" && (!bank.name || !bank.acct)) return alert("Please enter bank details.");
    if (method === "voucher" && (!voucher.code || !voucher.amt)) return alert("Please enter voucher code and amount.");
    const payload = {
      flight_id: activeRow?.flight_id,
      reservation_code: activeRow?.reservation_code,
      passenger: `${activeRow?.first_name} ${activeRow?.last_name}`,
      method, email,
      card_number: card.number, card_name: card.name, auth_ref: card.auth,
      bank_name: bank.name, bank_acct: bank.acct, bank_holder: bank.holder,
      voucher_code: voucher.code, voucher_amt: voucher.amt, voucher_exp: voucher.exp,
    };
    console.log("Refund payload:", payload);
    alert("Refund recorded (demo). Check console for payload.");
    closeRefund();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Stand by Privacy End-to-End Flow</h3>
            <p className="text-slate-600 text-sm mt-1">Horizontal infographic of the Standby Privacy Seat lifecycle</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Anchor booked</span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" />SBPS / Recheck / Admin</span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold">⏱ Recheck cycle: every 6h & payment time</span>
            </div>
          </div>
          <button className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold shadow-sm bg-amber-400 border border-amber-500" onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
        </header>

        <section className="my-7">
          <div className="flex gap-5 overflow-x-auto px-1 py-8">
            {STEPS.map((s, i) => (
              <article key={s.n} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white border-4 border-sky-400 shadow flex items-center justify-center font-extrabold text-lg text-sky-900">{s.n}</div>
                <div className="flex-shrink-0 bg-white border border-slate-200 rounded-2xl shadow p-4" style={{ width: "min(360px, 80vw)" }}>
                  <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                    {s.title}
                    {s.pill && <span className={pillTone(s.pill.tone)}>{s.pill.text}</span>}
                  </h3>
                  <p className="text-slate-600 text-sm">{s.body}</p>
                  {Array.isArray(s.pills) && (
                    <p className="text-slate-600 text-sm mt-2 flex flex-wrap gap-2">
                      {s.pills.map((p, idx) => (<span key={idx} className={pillTone(p.tone)}>{p.text}</span>))}
                    </p>
                  )}
                  {Array.isArray(s.outcomes) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      {s.outcomes.map((o, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white">
                          <span className={pillTone(o.tone)}>{o.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {i < STEPS.length - 1 && <div className="self-center font-extrabold text-2xl text-sky-900">→</div>}
              </article>
            ))}
          </div>
        </section>

        <h2 className="text-xl font-bold mt-6 mb-3">Stand by Privacy Seat  Admin & Call Center Console</h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_180px_140px] gap-2 mb-3">
          <input className="px-3 py-2 rounded-lg border border-slate-200 bg-white" placeholder="Search Flight ID, PNR, Name…" value={query} onChange={e => setQuery(e.target.value)} />
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>pending</option><option>standby</option><option>purchased</option><option>converted</option><option>refunded</option><option>completed</option><option>cancelled</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white" value={flightStatus} onChange={e => setFlightStatus(e.target.value)}>
            <option value="">All Flight Status</option>
            <option>scheduled</option><option>delayed</option><option>cancelled</option><option>departed</option>
          </select>
          <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold shadow-sm" onClick={() => exportCsv(filtered)}>Export CSV</button>
        </div>

        <div className="overflow-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-slate-50 text-slate-700 sticky top-0">
              <tr>
                <Th>Flight ID</Th><Th>PNR</Th><Th>Name</Th><Th>SBPS Seat</Th><Th>Anchor Seat</Th><Th>Block Seats</Th><Th>Price</Th><Th>Deposit</Th><Th>Expires</Th><Th>Status</Th><Th>Flight</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={12} className="py-6 text-center text-slate-500">No records found.</td></tr>}
              {filtered.map((r, i) => {
                const refundable = isRefundable(r.status);
                return (
                  <tr key={`${r.flight_id}-${r.reservation_code}-${i}`} className="border-t border-slate-200">
                    <Td>{r.flight_id}</Td>
                    <Td>{r.reservation_code}</Td>
                    <Td>{r.first_name} {r.last_name}</Td>
                    <Td>{r.sbps_seat_id}</Td>
                    <Td>{r.anchor_seat_id}</Td>
                    <Td>{r.impact_block_seats}</Td>
                    <Td>{fmtTHB(r.marked_up_price)}</Td>
                    <Td>{fmtTHB(r.deposit_amount)}</Td>
                    <Td>{r.offer_expires_at}</Td>
                    <Td><span className={statusBadge(r.status)}>{r.status}</span></Td>
                    <Td><span className={flightBadge(r.flight_status)}>{r.flight_status}</span></Td>
                    <Td>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Contact</button>
                        <button
                          className={`px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 ${!refundable ? "opacity-50 cursor-not-allowed" : ""}`}
                          title={!refundable ? "Refund only for converted/cancelled" : "Issue refund"}
                          onClick={() => refundable && openRefund(r)}
                          disabled={!refundable}
                        >Refund</button>
                        <button className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Release</button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between flex-wrap gap-2 text-slate-600 text-sm mt-4">
          <span>© 2025 SBPS Concept — Internal design</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
        </footer>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeRefund()}>
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold">Issue Refund</h3>
              <button className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50" onClick={closeRefund}>×</button>
            </div>
            <form className="p-4 space-y-4" onSubmit={onSubmitRefund}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Flight ID"><input className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50" value={activeRow?.flight_id || ""} readOnly /></Field>
                <Field label="PNR"><input className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50" value={activeRow?.reservation_code || ""} readOnly /></Field>
                <div className="md:col-span-2"><Field label="Passenger"><input className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50" value={`${activeRow?.first_name || ""} ${activeRow?.last_name || ""}`} readOnly /></Field></div>
              </div>

              <Field label="Refund Method">
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200" value={method} onChange={e => setMethod(e.target.value)}>
                  <option value="card">Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="voucher">Voucher</option>
                </select>
              </Field>

              {method === "card" && (
                <div className="space-y-2">
                  <Field label="Card Number"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" placeholder="XXXX-XXXX-XXXX-1234" value={card.number} onChange={e => setCard(c => ({...c, number: e.target.value}))} /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Cardholder Name"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" value={card.name} onChange={e => setCard(c => ({...c, name: e.target.value}))} /></Field>
                    <Field label="Auth/Txn Ref (optional)"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" value={card.auth} onChange={e => setCard(c => ({...c, auth: e.target.value}))} /></Field>
                  </div>
                </div>
              )}

              {method === "bank" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Bank Name"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" value={bank.name} onChange={e => setBank(b => ({...b, name: e.target.value}))} /></Field>
                    <Field label="Account Number"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" value={bank.acct} onChange={e => setBank(b => ({...b, acct: e.target.value}))} /></Field>
                  </div>
                  <Field label="Account Holder"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" value={bank.holder} onChange={e => setBank(b => ({...b, holder: e.target.value}))} /></Field>
                </div>
              )}

              {method === "voucher" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Voucher Code"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" value={voucher.code} onChange={e => setVoucher(v => ({...v, code: e.target.value}))} /></Field>
                    <Field label="Amount (THB)"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" type="number" value={voucher.amt} onChange={e => setVoucher(v => ({...v, amt: e.target.value}))} /></Field>
                  </div>
                  <Field label="Expiry (YYYY-MM-DD)"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" placeholder="2026-12-31" value={voucher.exp} onChange={e => setVoucher(v => ({...v, exp: e.target.value}))} /></Field>
                </div>
              )}

              <Field label="Notify Email"><input className="w-full px-3 py-2 rounded-lg border border-slate-200" type="email" value={email} onChange={e => setEmail(e.target.value)} /></Field>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-500">Refund allowed only for status: <b>converted</b> or <b>cancelled</b>.</div>
                <div className="flex gap-2">
                  <button type="button" className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50" onClick={closeRefund}>Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-lg border border-sky-300 bg-sky-400 text-white font-semibold">Confirm Refund</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function aOrB(filter, value) {
  return filter && filter !== value;
}
function fmtTHB(n) {
  return `${Number(n).toLocaleString("en-US")} THB`;
}
function pillTone(t) {
  if (t === "success") return "inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold";
  if (t === "warn") return "inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold";
  if (t === "danger") return "inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold";
  if (t === "info") return "inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold";
  return "inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold";
}
function statusBadge(s) {
  if (s === "pending") return "inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-amber-800 border border-amber-200 text-xs font-semibold";
  if (s === "standby") return "inline-flex items-center px-2 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold";
  if (s === "purchased") return "inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold";
  if (s === "converted") return "inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold";
  if (s === "refunded") return "inline-flex items-center px-2 py-1 rounded-md bg-lime-50 text-lime-800 border border-lime-200 text-xs font-semibold";
  if (s === "completed") return "inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold";
  if (s === "cancelled") return "inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold";
  return "inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold";
}
function flightBadge(s) {
  if (s === "scheduled") return "inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-900 border border-slate-200 text-xs font-semibold";
  if (s === "delayed") return "inline-flex items-center px-2 py-1 rounded-md bg-orange-50 text-orange-800 border border-orange-200 text-xs font-semibold";
  if (s === "cancelled") return "inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold";
  if (s === "departed") return "inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold";
  return "inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold";
}
function Th({ children }) {
  return <th className="text-left px-3 py-2 text-[13px]">{children}</th>;
}
function Td({ children }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      {children}
    </div>
  );
}
function exportCsv(arr) {
  const headers = ["flight_id","reservation_code","first_name","last_name","sbps_seat_id","anchor_seat_id","impact_block_seats","marked_up_price","deposit_amount","offer_expires_at","status","flight_status"];
  const rows = [headers.join(",")];
  arr.forEach(r => rows.push(headers.map(h => JSON.stringify(r[h] ?? "")).join(",")));
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sbps_admin_export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
