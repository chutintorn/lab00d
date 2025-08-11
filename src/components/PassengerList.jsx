import React from "react";
import { THEME } from "../config/theme";

export default function PassengerList({
  passengers,
  assignments,
  selectedPassengerId,
  noneLabel,
}) {
  return (
    <div className="mt-2">
      <div className="font-semibold mb-2">Passenger seats</div>
      <div className="space-y-1">
        {passengers.map((p) => {
          const seat = assignments[p.id] || "";
          const isActive = p.id === selectedPassengerId;

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: THEME.outline,
                backgroundColor: isActive ? "#e0f7ff" : "#ffffff",
              }}
            >
              <div
                className={`truncate mr-2 font-semibold ${
                  isActive ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {p.name}
              </div>
              <div
                className={`font-bold ${
                  seat ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {seat || noneLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
