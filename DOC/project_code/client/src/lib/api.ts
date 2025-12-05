import axios from 'axios';
import { Device, Alert, Site, NetworkInterface } from './types';

// Configure your FastAPI backend URL here
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Devices
export const getDevices = async () => {
  const response = await api.get<Device[]>('/devices');
  return response.data;
};

export const getDevice = async (id: number) => {
  const response = await api.get<Device>(`/devices/${id}`);
  return response.data;
};

export const createDevice = async (device: Partial<Device>) => {
  const response = await api.post<Device>('/devices', device);
  return response.data;
};

export const deleteDevice = async (id: number) => {
  await api.delete(`/devices/${id}`);
};

// Interfaces
export const getDeviceInterfaces = async (deviceId: number) => {
  const response = await api.get<NetworkInterface[]>(`/devices/${deviceId}/interfaces`);
  return response.data;
};

// Alerts
export const getAlerts = async () => {
  const response = await api.get<Alert[]>('/alerts');
  return response.data;
};

// Sites
export const getSites = async () => {
  const response = await api.get<Site[]>('/sites');
  return response.data;
};

// Topology
export const getTopology = async () => {
  const response = await api.get('/topology');
  return response.data;
};
