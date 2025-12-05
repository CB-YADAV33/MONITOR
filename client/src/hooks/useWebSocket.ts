import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateDeviceStatus } from '@/features/devices/devicesSlice';
import { addAlert } from '@/features/alerts/alertsSlice';
import { addMacChange } from '@/features/devices/macChangeSlice'; // You'll create this slice

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Connect to your backend WebSocket
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'DEVICE_UPDATE':
            dispatch(updateDeviceStatus(data.payload));
            break;

          case 'NEW_ALERT':
            dispatch(addAlert(data.payload));
            break;

          case 'MAC_CHANGE':
            // payload: { id, device_id, interface, old_mac, new_mac, timestamp }
            dispatch(addMacChange(data.payload));
            break;

          default:
            console.warn('Unknown WebSocket event type:', data.type);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url, dispatch]);

  return { isConnected };
}
