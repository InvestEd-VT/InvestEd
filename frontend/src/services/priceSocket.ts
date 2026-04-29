import { create } from 'zustand';

interface PriceData {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface PriceSocketState {
  prices: Record<string, PriceData>;
  connected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  getPrice: (symbol: string) => PriceData | undefined;
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

/**
 * INVESTED-207: WebSocket client in frontend
 * INVESTED-208: Stream live options price updates to frontend
 * INVESTED-209: Handle reconnection on disconnect
 * INVESTED-210: Integrate websocket updates with zustand store
 */
export const usePriceSocket = create<PriceSocketState>((set, get) => ({
  prices: {},
  connected: false,

  connect: (token: string) => {
    if (ws?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:5001`;
    const url = `${host}/prices?token=${token}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
      set({ connected: true });
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'price') {
          set((state) => ({
            prices: {
              ...state.prices,
              [msg.symbol]: {
                symbol: msg.symbol,
                price: msg.price,
                open: msg.open,
                high: msg.high,
                low: msg.low,
                close: msg.close,
                volume: msg.volume,
                timestamp: msg.timestamp,
              },
            },
          }));
        }
      } catch {
        // Ignore malformed messages
      }
    };

    // INVESTED-209: Handle reconnection on disconnect
    ws.onclose = (event) => {
      set({ connected: false });
      ws = null;

      // Don't reconnect if intentionally closed (code 1000) or auth failure (4001)
      if (event.code === 1000 || event.code === 4001) return;

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
        reconnectAttempts++;
        reconnectTimer = setTimeout(() => {
          get().connect(token);
        }, delay);
      }
    };

    ws.onerror = () => {
      // Error will trigger onclose, which handles reconnection
    };
  },

  disconnect: () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
    if (ws) {
      ws.close(1000, 'Client disconnect');
      ws = null;
    }
    set({ connected: false });
  },

  subscribe: (symbol: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', symbol: symbol.toUpperCase() }));
    }
  },

  unsubscribe: (symbol: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'unsubscribe', symbol: symbol.toUpperCase() }));
    }
  },

  getPrice: (symbol: string) => {
    return get().prices[symbol.toUpperCase()];
  },
}));

/**
 * INVESTED-216: Fall back to REST if websocket disconnects
 * Hook that returns live price from WebSocket, or undefined to signal REST fallback.
 */
export function useLivePrice(symbol: string): PriceData | undefined {
  const price = usePriceSocket((state) => state.prices[symbol.toUpperCase()]);
  return price;
}
