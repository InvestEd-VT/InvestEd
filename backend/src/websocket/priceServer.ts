import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import prisma from '../config/database.js';
import {
  refreshPrices,
  invalidateStockPrice,
  cacheStockPrice,
} from '../services/priceCache.service.js';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  subscribedSymbols?: Set<string>;
  isAlive?: boolean;
}

// Track all connected clients
const clients = new Set<AuthenticatedSocket>();

// Global set of all symbols being watched
const watchedSymbols = new Set<string>();

/**
 * INVESTED-205: Set up websocket server on backend
 * Attaches a WebSocket server to the HTTP server.
 * Authenticates via JWT in the connection URL query param.
 */
export function createPriceServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/prices' });

  wss.on('connection', async (ws: AuthenticatedSocket, req) => {
    // Authenticate via ?token=<jwt>
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Missing authentication token');
      return;
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      ws.userId = decoded.userId;
    } catch {
      ws.close(4001, 'Invalid authentication token');
      return;
    }

    ws.subscribedSymbols = new Set();
    ws.isAlive = true;
    clients.add(ws);

    logger.info('WebSocket client connected', { userId: ws.userId, total: clients.size });

    // Auto-subscribe to user's portfolio symbols
    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { userId: ws.userId },
        include: { positions: { where: { status: 'OPEN' }, select: { symbol: true } } },
      });
      if (portfolio) {
        for (const pos of portfolio.positions) {
          ws.subscribedSymbols.add(pos.symbol.toUpperCase());
          watchedSymbols.add(pos.symbol.toUpperCase());
        }
      }
    } catch (err) {
      logger.warn('Failed to load portfolio symbols', { error: (err as Error).message });
    }

    // Handle messages from client
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'subscribe' && msg.symbol) {
          const sym = String(msg.symbol).toUpperCase();
          ws.subscribedSymbols?.add(sym);
          watchedSymbols.add(sym);
          logger.debug('Client subscribed', { userId: ws.userId, symbol: sym });
        } else if (msg.type === 'unsubscribe' && msg.symbol) {
          ws.subscribedSymbols?.delete(String(msg.symbol).toUpperCase());
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      clients.delete(ws);
      logger.info('WebSocket client disconnected', { userId: ws.userId, total: clients.size });
      rebuildWatchedSymbols();
    });
  });

  // Heartbeat: ping every 30s, close stale connections
  const heartbeat = setInterval(() => {
    for (const ws of clients) {
      if (!ws.isAlive) {
        clients.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);

  // INVESTED-206: Subscribe to price feed — poll Polygon every 15 seconds
  const priceBroadcast = setInterval(async () => {
    if (watchedSymbols.size === 0) return;

    try {
      const symbols = Array.from(watchedSymbols);
      const prices = await refreshPrices(symbols);

      // Broadcast to subscribed clients
      for (const ws of clients) {
        if (ws.readyState !== WebSocket.OPEN) continue;
        for (const [symbol, data] of prices) {
          if (ws.subscribedSymbols?.has(symbol)) {
            ws.send(
              JSON.stringify({
                type: 'price',
                symbol,
                price: data.price,
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.close,
                volume: data.volume,
                timestamp: data.timestamp,
              })
            );
          }
        }
      }
    } catch (err) {
      logger.warn('Price broadcast failed', { error: (err as Error).message });
    }
  }, 15000);

  wss.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(priceBroadcast);
  });

  logger.info('WebSocket price server started', { path: '/prices' });
  return wss;
}

/**
 * Rebuild the global watched symbols set from all connected clients.
 */
function rebuildWatchedSymbols(): void {
  watchedSymbols.clear();
  for (const ws of clients) {
    if (ws.subscribedSymbols) {
      for (const sym of ws.subscribedSymbols) {
        watchedSymbols.add(sym);
      }
    }
  }
}
