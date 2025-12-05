import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MacChangeLog {
  id: number;
  device_id: number;
  interface: string;
  old_mac: string;
  new_mac: string;
  timestamp: string;
}

interface MacChangeState {
  logs: Record<number, MacChangeLog[]>; // keyed by device_id
}

const initialState: MacChangeState = {
  logs: {},
};

const macChangeSlice = createSlice({
  name: 'macChanges',
  initialState,
  reducers: {
    addMacChange: (state, action: PayloadAction<MacChangeLog>) => {
      const log = action.payload;
      if (!state.logs[log.device_id]) {
        state.logs[log.device_id] = [];
      }
      state.logs[log.device_id].unshift(log); // latest first
    },
    setMacChangesForDevice: (state, action: PayloadAction<{ device_id: number; logs: MacChangeLog[] }>) => {
      state.logs[action.payload.device_id] = action.payload.logs;
    },
    clearMacChanges: (state) => {
      state.logs = {};
    },
  },
});

export const { addMacChange, setMacChangesForDevice, clearMacChanges } = macChangeSlice.actions;
export default macChangeSlice.reducer;
