import React, { useState } from "react";
import PassengerBookingUpdateSeat from "./pages/PassengerBookingUpdateSeat";
import SbpsAdminConsole from "./components/SbpsAdminConsole";
import ConfirmationPage from "./components/ConfirmationPage";

// Serve the HTML that lives in src/components/
const IBE_URL = new URL(
  "./components/seatmap_nokair_v6_header_align_left.html",
  import.meta.url
).toString();

export default function App() {
  const [activeTab, setActiveTab] = useState("booking");

  const tabCls = (isActive) =>
    `px-4 py-2 rounded-lg font-semibold ${
      isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 flex justify-center space-x-4">
        <button onClick={() => setActiveTab("booking")} className={tabCls(activeTab === "booking")}>
          Booking Page
        </button>
        <button onClick={() => setActiveTab("admin")} className={tabCls(activeTab === "admin")}>
          SBPS Admin
        </button>
        <button onClick={() => setActiveTab("journey")} className={tabCls(activeTab === "journey")}>
          Customer Journey
        </button>
        {/* NEW: IBE Journey renders inside the app, like other tabs */}
        <button onClick={() => setActiveTab("ibe")} className={tabCls(activeTab === "ibe")}>
          IBE Journey
        </button>
      </div>

      <div className="p-4">
        {activeTab === "booking" && <PassengerBookingUpdateSeat />}
        {activeTab === "admin" && <SbpsAdminConsole />}
        {activeTab === "journey" && <ConfirmationPage />}

        {activeTab === "ibe" && (
          <div className="h-[80vh]">
            {/* iframe keeps the HTML (with its own Tailwind) isolated from your app styles */}
            <iframe
              src={IBE_URL}
              title="IBE Journey"
              loading="lazy"
              className="w-full h-full rounded-lg border"
            />
            {/* optional: also offer a new-tab link */}
            <div className="mt-2 text-sm">
              <a
                href={IBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Open in new tab ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
