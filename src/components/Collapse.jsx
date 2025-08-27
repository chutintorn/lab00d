// src/components/Collapse.jsx
import React from "react";

export default function Collapse({ open, onToggle, summary, children }) {
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 border rounded-xl bg-white"
      >
        <span className="font-semibold">{summary}</span>
        <span className="text-sm opacity-70">{open ? "Hide" : "Show"}</span>
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
