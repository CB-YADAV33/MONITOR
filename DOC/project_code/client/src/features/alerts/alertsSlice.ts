import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '@/lib/types';
import { MOCK_ALERTS } from '@/lib/mockData';

interface AlertsState {
  items: Alert[];
  unreadCount: number;
}

const initialState: AlertsState = {
  items: MOCK_ALERTS,
  unreadCount: MOCK_ALERTS.filter(a => !a.acknowledged).length,
};

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    acknowledgeAlert: (state, action: PayloadAction<number>) => {
      const alert = state.items.find(a => a.id === action.payload);
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true;
        state.unreadCount -= 1;
      }
    },
    clearAllAlerts: (state) => {
      state.items = [];
      state.unreadCount = 0;
    }
  },
});

export const { addAlert, acknowledgeAlert, clearAllAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;
