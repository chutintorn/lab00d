// src/i18n/strings.js
export const STR = {
  EN: {
    legLabel: "Flight",
    passengerLabel: "Passenger",
    selectedSeat: "Selected seat",
    none: "Not selected",
    book: "Book",
    clearSelection: "Clear Selection",
    saveLocal: "Save (local)",
    savedTick: "Saved!",
    resetToFile: "Reset to file seats",
    cancel: "Cancel Booking",
    clearAll: "Clear All (local)",
    savedHint: "Bookings are saved in your browser.",
    listTitle: "Passenger seats",
    legend: {
      fp: "Premium Front Row",
      p: "Premium",
      h: "Happy",
      b: "Booked",
      u: "Unavailable",
      s: "Selected",
      pr: "Privacy",
    },

    // NEW: controls
    controls: {
      showPrices: "Show prices on seat map",
    },

    // UPDATED: privacy note no longer hardcodes 50 THB (fees vary by zone)
    privacy: {
      title: "Privacy seats for this passenger",
      note: "Privacy seats have a fee based on the seat zone and can still be booked by others.",
      total: "Privacy cost",
      clear: "Clear Privacy",
      taken: "Already marked as privacy by another passenger.",

      // NEW: dynamic fee and refund copy
      feePerSeat: "Privacy per seat",
      refundTitle: "Refund if a privacy seat is sold",
      // Use {fee} and {refund} placeholders; we substitute them in the component
      refundLine:
        "You paid {fee} THB per seat. If someone purchases that seat, you’ll be refunded {refund} THB per sold seat.",
      confirm: "Confirm privacy",
    },

    // NEW: mini fare summary box
    fare: {
      title: "Fare summary",
      base: "Base seat",
      privacy: "Privacy seats",
      total: "Total",
    },
  },

  TH: {
    legLabel: "เที่ยวบิน",
    passengerLabel: "ผู้โดยสาร",
    selectedSeat: "ที่นั่งที่เลือก",
    none: "ยังไม่ได้เลือก",
    book: "จอง",
    clearSelection: "ล้างการเลือก",
    saveLocal: "บันทึก (ภายในเครื่อง)",
    savedTick: "บันทึกแล้ว!",
    resetToFile: "รีเซ็ตเป็นที่นั่งจากไฟล์",
    cancel: "ยกเลิกการจอง",
    clearAll: "ล้างทั้งหมด (ภายในเครื่อง)",
    savedHint: "บันทึกไว้ในเบราว์เซอร์ของคุณ",
    listTitle: "ที่นั่งของผู้โดยสาร",
    legend: {
      fp: "พรีเมียมแถวหน้า",
      p: "พรีเมียม",
      h: "แฮปปี้",
      b: "ถูกจอง",
      u: "ไม่ว่าง",
      s: "ที่เลือก",
      pr: "ที่นั่งส่วนตัว",
    },

    // NEW: controls
    controls: {
      showPrices: "แสดงราคาในแผนผังที่นั่ง",
    },

    // UPDATED: privacy note to reflect zone-based fee
    privacy: {
      title: "ที่นั่งส่วนตัวของผู้โดยสารนี้",
      note: "ที่นั่งส่วนตัวคิดค่าบริการตามโซน และยังสามารถถูกผู้อื่นจองได้",
      total: "ค่าที่นั่งส่วนตัว",
      clear: "ล้างที่นั่งส่วนตัว",
      taken: "ถูกทำเป็นที่นั่งส่วนตัวโดยผู้อื่นแล้ว",

      // NEW: dynamic fee and refund copy
      feePerSeat: "ค่าที่นั่งส่วนตัว/ที่นั่ง",
      refundTitle: "เงินคืนเมื่อที่นั่งส่วนตัวถูกซื้อ",
      refundLine:
        "คุณจ่าย {fee} THB ต่อที่นั่ง หากมีผู้อื่นซื้อที่นั่งนั้น คุณจะได้รับเงินคืน {refund} THB ต่อที่นั่งที่ถูกซื้อ",
      confirm: "ยืนยันที่นั่งส่วนตัว",
    },

    // NEW: mini fare summary box
    fare: {
      title: "สรุปราคา",
      base: "ค่าเก้าอี้",
      privacy: "ที่นั่งส่วนตัว",
      total: "รวม",
    },
  },
};
