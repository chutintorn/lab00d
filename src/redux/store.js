import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import hotelSelectionReducer from './hotelSelectionSlice';
import transportSelectionReducer from './transportSelectionSlice';
import eventSelectionReducer from './eventSelectionSlice';
import eventDatesReducer from './eventDatesSlice'; // ✅ เพิ่มมาใหม่

export const store = configureStore({
  reducer: {
    language: languageReducer,
    hotelSelection: hotelSelectionReducer,
    transportSelection: transportSelectionReducer,
    eventSelection: eventSelectionReducer,
    eventDates: eventDatesReducer, // ✅ ใส่เข้า store
  },
});
