import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
const RECONNECT_DELAY = 3000;

export const useWebSocket = (onMessage) => {
  const wsRef = useRef(null);
  const [status, setStatus] = useState('connecting'); // connecting | connected | disconnected
  const reconnectTimer = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      setStatus('connecting');

      ws.onopen = () => {
        setStatus('connected');
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current?.(data);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      setStatus('disconnected');
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status };
};
