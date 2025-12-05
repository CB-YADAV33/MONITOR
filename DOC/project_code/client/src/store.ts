import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from './features/devices/devicesSlice';
import alertsReducer from './features/alerts/alertsSlice';

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    alerts: alertsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
