import { createSlice } from '@reduxjs/toolkit';

const eventSelectionSlice = createSlice({
  name: 'eventSelection',
  initialState: {
    defaultEventId: null,
    passengers: {} // { 0: { eventId: 1 }, 1: { eventId: 3 } }
  },
  reducers: {
    setDefaultEvent(state, action) {
      state.defaultEventId = action.payload.eventId;
    },
    selectEventForPassenger(state, action) {
      const { paxId, eventId } = action.payload;
      state.passengers[paxId] = { eventId };
    },
    // ✅ New reset function
    resetEvents(state) {
      state.defaultEventId = null;
      state.passengers = {};
    }
  }
});

export const { setDefaultEvent, selectEventForPassenger, resetEvents } =
  eventSelectionSlice.actions;

export default eventSelectionSlice.reducer;
