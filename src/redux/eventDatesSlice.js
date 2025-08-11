// redux/eventDatesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const eventDatesSlice = createSlice({
  name: 'eventDates',
  initialState: {},  // { paxId: "2025-07-30", ... }
  reducers: {
    setEventDate: (state, action) => {
      const { paxId, date } = action.payload;
      state[paxId] = date;
    },
    resetEventDates: () => ({}),
    loadEventDates: (state, action) => {
      return action.payload || {};
    },
  },
});

export const { setEventDate, resetEventDates, loadEventDates } = eventDatesSlice.actions;
export default eventDatesSlice.reducer;
