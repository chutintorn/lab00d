// src/components/StandbyPrivacyFlow.jsx
import React from "react";
import { THEME } from "../config/theme";

export default function StandbyPrivacyFlow() {
  const Step = ({ title, details }) => (
    <div className="flex gap-3">
      <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-700">{details}</div>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-xl border p-4 bg-amber-50 shadow-sm"
      style={{ borderColor: THEME.outline }}
    >
      <div className="text-amber-800 font-bold mb-2">
        Standby Privacy – End-to-End Flow
      </div>

      <div className="space-y-3 text-amber-900">
        <Step
          title="1) เจ้าของซื้อ Privacy Seat"
          details="ผู้โดยสาร A ซื้อที่นั่งหลัก และเลือกทำที่นั่งข้างเคียงเป็น Privacy (โซนละ 200 / 150 / 100 THB)"
        />
        <Step
          title="2) ราคา Mark-up +20% สำหรับผู้อื่น"
          details="ขณะเป็น Privacy ของผู้อื่น ราคาที่นั่งจะเป็น Base × 1.2 (500→600, 350→420, 150→180)"
        />
        <Step
          title="3) ถ้ามีคนซื้อที่นั่ง Privacy"
          details="ระบบยกเลิกสถานะ Privacy สำหรับที่นั่งนั้น และคืนเงินให้เจ้าของ Privacy = ค่าทำ Privacy + ส่วนแบ่ง Top-up (FP ได้ 50% → 200+50 = 250, Premium/Happy ได้ 100% → 150+70 = 220 / 100+30 = 130)"
        />
        <Step
          title="4) ยกเลิก Privacy"
          details="ถ้าเจ้าของยกเลิก Privacy ราคาที่นั่งจะกลับเป็น Base ปกติทันที"
        />
      </div>
    </div>
  );
}
