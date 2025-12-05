import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateDeviceStatus } from '@/features/devices/devicesSlice';
import { addAlert } from '@/features/alerts/alertsSlice';

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // In a real scenario, replace with your actual WebSocket URL
    // const socket = new WebSocket(url);
    
    // Mocking the WebSocket for the prototype
    // In production: ws.current = socket;
    
    setIsConnected(true);

    // Mock incoming messages
    const interval = setInterval(() => {
      // 10% chance of status change
      if (Math.random() > 0.9) {
        const mockUpdate = {
          type: 'DEVICE_UPDATE',
          payload: {
            id: Math.floor(Math.random() * 6) + 1,
            status: (Math.random() > 0.5 ? 'online' : 'warning') as 'online' | 'warning'
          }
        };
        
        // Dispatch to Redux
        dispatch(updateDeviceStatus(mockUpdate.payload));
      }
    }, 2000);

    /* Real Implementation:
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'DEVICE_UPDATE') {
        dispatch(updateDeviceStatus(data.payload));
      } else if (data.type === 'NEW_ALERT') {
        dispatch(addAlert(data.payload));
      }
    };
    */

    return () => {
      clearInterval(interval);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, dispatch]);

  return { isConnected };
}
