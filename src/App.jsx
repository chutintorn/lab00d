import React, { useState } from "react";
import PassengerBookingUpdateSeat from "./pages/PassengerBookingUpdateSeat";
import SbpsAdminConsole from "./components/SbpsAdminConsole";

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 flex justify-center space-x-4">
        <button
          onClick={() => setShowAdmin(false)}
          className={`px-4 py-2 rounded-lg font-semibold ${!showAdmin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Booking Page
        </button>
        <button
          onClick={() => setShowAdmin(true)}
          className={`px-4 py-2 rounded-lg font-semibold ${showAdmin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          SBPS Admin
        </button>
      </div>

      <div className="p-4">
        {showAdmin ? <SbpsAdminConsole /> : <PassengerBookingUpdateSeat />}
      </div>
    </div>
  );
}
