import { createSlice } from '@reduxjs/toolkit';

const hotelSelectionSlice = createSlice({
  name: 'hotelSelection',
  initialState: {},
  reducers: {
    selectHotel: (state, action) => {
      const { paxId, hotelName, taxiCode } = action.payload;
      state[paxId] = {
        ...state[paxId],
        hotelName,
        taxiCode,
        roomNumber: '',
        roomType: '',     // ✅ clear roomType when hotel changes
        stayDays: 1,
      };
    },
    selectRoom: (state, action) => {
      const { paxId, roomNumber, roomType } = action.payload;
      if (!state[paxId]) return;
      state[paxId].roomNumber = roomNumber;
      state[paxId].roomType = roomType; // ✅ store roomType
    },
    selectStayDays: (state, action) => {
      const { paxId, stayDays } = action.payload;
      if (!state[paxId]) return;
      state[paxId].stayDays = stayDays;
    },

    // ✅ New reset function
    resetHotels: () => {
      return {}; // Reset all hotel selections
    },
  },
});

export const { selectHotel, selectRoom, selectStayDays, resetHotels } =
  hotelSelectionSlice.actions;

export default hotelSelectionSlice.reducer;
