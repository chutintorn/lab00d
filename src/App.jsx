import React, { useState } from "react";
import PassengerBookingUpdateSeat from "./pages/PassengerBookingUpdateSeat";
import SbpsAdminConsole from "./components/SbpsAdminConsole";
import ConfirmationPage from "./components/ConfirmationPage"; // ✅ New import

export default function App() {
  const [activeTab, setActiveTab] = useState("booking");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 flex justify-center space-x-4">
        <button
          onClick={() => setActiveTab("booking")}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "booking" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Booking Page
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          SBPS Admin
        </button>
        <button
          onClick={() => setActiveTab("journey")}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "journey" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Customer Journey
        </button>
      </div>

      <div className="p-4">
        {activeTab === "booking" && <PassengerBookingUpdateSeat />}
        {activeTab === "admin" && <SbpsAdminConsole />}
        {activeTab === "journey" && <ConfirmationPage />}
      </div>
    </div>
  );
}
