import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from './features/devices/devicesSlice';
import alertsReducer from './features/alerts/alertsSlice';
import macChangeReducer from './features/devices/macChangeSlice';

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    alerts: alertsReducer,
    macChanges: macChangeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
