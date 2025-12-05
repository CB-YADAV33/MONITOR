import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '@/lib/types';
import { getAlerts } from '@/lib/api';

interface AlertsState {
  items: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchAlerts = createAsyncThunk('alerts/fetchAlerts', async () => {
  const alerts = await getAlerts();
  return alerts;
});

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.items = action.payload;
      state.unreadCount = action.payload.length;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    acknowledgeAlert: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex(a => a.id === action.payload);
      if (index !== -1) {
        state.items.splice(index, 1);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearAllAlerts: (state) => {
      state.items = [];
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch alerts';
      });
  },
});

export const { setAlerts, addAlert, acknowledgeAlert, clearAllAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;
