import { createSlice } from '@reduxjs/toolkit';

const transportSelectionSlice = createSlice({
  name: 'transportSelection',
  initialState: {},
  reducers: {
    selectTransportCompany: (state, action) => {
      const { paxId, companyCode, companyName } = action.payload;
      state[paxId] = {
        ...state[paxId],
        companyCode,
        companyName,
        direction: '',
        priceTHB: 0,
      };
    },
    selectTransportDirection: (state, action) => {
      const { paxId, direction, priceTHB } = action.payload;
      if (!state[paxId]) return;
      state[paxId].direction = direction;
      state[paxId].priceTHB = priceTHB;
    },

    // ✅ New reset function
    resetTransport: () => {
      return {}; // Clear all transport selections
    },
  },
});

export const {
  selectTransportCompany,
  selectTransportDirection,
  resetTransport, // ✅ export the reset action
} = transportSelectionSlice.actions;

export default transportSelectionSlice.reducer;
