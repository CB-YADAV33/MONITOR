import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Device, NetworkInterface } from '@/lib/types';
import { MOCK_DEVICES, generateInterfaces } from '@/lib/mockData';

interface DevicesState {
  items: Device[];
  selectedDevice: Device | null;
  selectedDeviceInterfaces: NetworkInterface[];
  loading: boolean;
  filter: string;
}

const initialState: DevicesState = {
  items: MOCK_DEVICES,
  selectedDevice: null,
  selectedDeviceInterfaces: [],
  loading: false,
  filter: 'all',
};

export const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.items = action.payload;
    },
    addDevice: (state, action: PayloadAction<Device>) => {
      state.items.push(action.payload);
    },
    updateDeviceStatus: (state, action: PayloadAction<{ id: number; status: Device['status'] }>) => {
      const device = state.items.find(d => d.id === action.payload.id);
      if (device) {
        device.status = action.payload.status;
      }
    },
    selectDevice: (state, action: PayloadAction<number>) => {
      state.selectedDevice = state.items.find(d => d.id === action.payload) || null;
      if (state.selectedDevice) {
        state.selectedDeviceInterfaces = generateInterfaces(state.selectedDevice.id);
      } else {
        state.selectedDeviceInterfaces = [];
      }
    },
    deleteDevice: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(d => d.id !== action.payload);
      if (state.selectedDevice?.id === action.payload) {
        state.selectedDevice = null;
        state.selectedDeviceInterfaces = [];
      }
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    }
  },
});

export const { setDevices, addDevice, updateDeviceStatus, selectDevice, deleteDevice, setFilter } = devicesSlice.actions;
export default devicesSlice.reducer;
