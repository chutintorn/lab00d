// src/data/booking.js

// โหลดข้อมูลจากไฟล์ JSON จริง
import bookingJson from "./DMK-CNX-Roundtrip-4-pax-seats-bag.json";

// Export ค่าที่ใช้เป็นแหล่งข้อมูลหลัก
// คงโครงสร้าง { data: {...} } เพื่อให้ parseBooking() ใช้ได้เหมือนเดิม
export const BOOKING_SOURCE = {
  data: bookingJson.data
};

/**
 * แปลงข้อมูล booking ให้พร้อมใช้ใน UI
 * @param {Object} json - ข้อมูล booking ในรูปแบบ { data: {...} }
 * @returns {Object} { confirmationNumber, legs: [...] }
 */
export function parseBooking(json) {
  const conf = json?.data?.confirmationNumber || "UNKNOWN";

  const legs = (json?.data?.airlines || []).map((leg, idx) => ({
    key: `${conf}:${idx}`,
    title: `${leg.origin} → ${leg.destination} (${new Date(leg.departureTime).toLocaleString()})`,
    passengers: (leg.passengerDetails || []).map((p) => ({
      id: String(p.paxNumber),
      name: `${p.title ?? ""} ${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
      seat: p.seatSelect || "",
    })),
  }));

  return { confirmationNumber: conf, legs };
}
