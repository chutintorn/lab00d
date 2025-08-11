export const BOOKING_SOURCE = {
  data: {
    confirmationNumber: "4RSFSR",
    airlines: [
      {
        origin: "DMK",
        destination: "CNX",
        departureTime: "2025-08-10 05:15:00",
        passengerDetails: [
          { paxNumber: 1, title: "MR", firstName: "ANUKUL", lastName: "TEST", seatSelect: "1C" },
          { paxNumber: 2, title: "MS", firstName: "PAWEENA", lastName: "TEST", seatSelect: "2A" },
          { paxNumber: 3, title: "MR", firstName: "RATIMA", lastName: "TEST", seatSelect: "2B" },
          { paxNumber: 4, title: "MR", firstName: "RATIYA", lastName: "TEST", seatSelect: "2C" },
        ],
      },
      {
        origin: "CNX",
        destination: "DMK",
        departureTime: "2025-08-15 02:00:00",
        passengerDetails: [
          { paxNumber: 1, title: "MR", firstName: "ANUKUL", lastName: "TEST", seatSelect: "4A" },
          { paxNumber: 2, title: "MS", firstName: "PAWEENA", lastName: "TEST", seatSelect: "2A" },
          { paxNumber: 3, title: "MR", firstName: "RATIMA", lastName: "TEST", seatSelect: "2B" },
          { paxNumber: 4, title: "MR", firstName: "RATIYA", lastName: "TEST", seatSelect: "2C" },
        ],
      },
    ],
  },
};

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
