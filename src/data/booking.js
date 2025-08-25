// src/data/booking.js
import RAW from "./DMK-CNX-Roundtrip-4-pax-seats-bag.json";

// เปิดไว้ให้ส่วนอื่นเรียกเหมือนเดิม
export const BOOKING_SOURCE = RAW;

/**
 * แปลง RAW booking JSON -> รูปแบบภายในแอป
 * - ดึง flightNumber จาก airlines[i].travelInfos[0].flightNumber
 * - ตั้ง title ของแต่ละ leg เป็น: "DD122 · DMK → CNX (8/10/2025, 5:15:00 AM)"
 */
export function parseBooking(src) {
  const data = src?.data || {};
  const airlines = Array.isArray(data.airlines) ? data.airlines : [];

  const legs = airlines.map((ai, i) => {
    const flightNumber = ai?.travelInfos?.[0]?.flightNumber || null; // เลขไฟลต์
    // แปลงวันเวลาให้อ่านง่าย
    const dep = ai?.departureTime ? new Date(ai.departureTime.replace(" ", "T")) : null;
    const depTxt = dep ? dep.toLocaleString() : "";

    const title = `${flightNumber ? `${flightNumber} · ` : ""}${ai.origin} → ${ai.destination}${depTxt ? ` (${depTxt})` : ""}`;

    // ผู้โดยสารของเล็ก
    const passengers = (ai.passengerDetails || []).map((p) => ({
      id: String(p.paxNumber),
      // รวมคำนำหน้าไว้ด้วย (MR/MS/ฯลฯ)
      name: `${p.title ?? ""} ${p.firstName ?? ""} ${p.lastName ?? ""}`.replace(/\s+/g, " ").trim(),
      seat: p.seatSelect || "",
    }));

    return {
      key: `${ai.origin}-${ai.destination}-${i}`,
      title,
      flightNumber,
      origin: ai.origin,
      destination: ai.destination,
      departureTime: ai.departureTime,
      arrivalTime: ai.arrivalTime,
      passengers,
    };
  });

  return { legs };
}
