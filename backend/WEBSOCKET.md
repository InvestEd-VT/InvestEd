# WebSocket Protocol Documentation

InvestEd uses a WebSocket connection to stream live stock price updates to the frontend. This document describes the protocol, message formats, and behavior.

---

## Connection

**URL:** `ws://<host>/prices?token=<jwt>`

- In production, use `wss://` (TLS).
- The path is always `/prices`.
- The JWT token is passed as a query parameter named `token`.

**Example:**

```
wss://backend-production-7416.up.railway.app/prices?token=eyJhbGciOiJIUzI1NiIs...
```

The frontend determines the WebSocket URL from the `VITE_WS_URL` environment variable. If unset, it falls back to the current page host on port 5001.

---

## Authentication

The server verifies the JWT token on connection using the same `JWT_SECRET` used for REST API authentication.

- If the token is missing, the server closes the connection with code **4001** and reason "Missing authentication token".
- If the token is invalid or expired, the server closes with code **4001** and reason "Invalid authentication token".
- On success, the server associates the connection with the `userId` extracted from the token payload.

---

## Auto-Subscription

Immediately after a successful connection, the server queries the database for the user's open portfolio positions and automatically subscribes the connection to price updates for those symbols. No client action is required for this.

---

## Client Messages

Clients send JSON messages to manage their subscriptions.

### Subscribe

Add a symbol to the connection's watch list.

```json
{ "type": "subscribe", "symbol": "AAPL" }
```

- Symbols are normalized to uppercase on the server.
- Subscribing to a symbol that is already subscribed is a no-op.

### Unsubscribe

Remove a symbol from the connection's watch list.

```json
{ "type": "unsubscribe", "symbol": "AAPL" }
```

- Unsubscribing from a symbol that is not currently subscribed is a no-op.

Malformed messages (non-JSON or missing fields) are silently ignored.

---

## Server Messages

### Price Update

The server broadcasts price data every **15 seconds** for all symbols that any connected client is watching.

```json
{
  "type": "price",
  "symbol": "AAPL",
  "price": 187.44,
  "open": 186.10,
  "high": 188.02,
  "low": 185.50,
  "close": 187.44,
  "volume": 52341200,
  "timestamp": 1713700800000
}
```

| Field       | Type   | Description                        |
| ----------- | ------ | ---------------------------------- |
| `type`      | string | Always `"price"`                   |
| `symbol`    | string | Uppercase ticker symbol            |
| `price`     | number | Current / last traded price        |
| `open`      | number | Opening price for the day          |
| `high`      | number | Day high                           |
| `low`       | number | Day low                            |
| `close`     | number | Previous close (or current close)  |
| `volume`    | number | Trading volume                     |
| `timestamp` | number | Unix timestamp in milliseconds     |

Each client only receives updates for the symbols it is subscribed to.

---

## Heartbeat

The server pings every connected client every **30 seconds**.

- On each ping cycle, the server checks whether the client responded to the previous ping (via a WebSocket pong frame).
- If a client has not responded, the server considers it stale and terminates the connection.
- Clients using the browser `WebSocket` API respond to pings automatically; no application-level handling is needed.

---

## Reconnection

The frontend client (`priceSocket.ts`) implements automatic reconnection with exponential backoff.

| Attempt | Delay  |
| ------- | ------ |
| 1       | 1s     |
| 2       | 2s     |
| 3       | 4s     |
| 4       | 8s     |
| 5       | 16s    |
| 6       | 32s    |
| 7       | 64s    |
| 8       | 128s   |
| 9       | 256s   |
| 10      | 512s   |

- Maximum reconnect attempts: **10**
- The delay formula is `1000 * 2^attempt` milliseconds.
- Reconnection is **not** attempted when the close code is **1000** (normal closure) or **4001** (authentication failure).
- Calling `disconnect()` explicitly prevents any further reconnection attempts.

---

## Watched Symbols Management

The server maintains a global set of all symbols being watched across all connected clients. This set is used to determine which symbols to fetch prices for during the 15-second broadcast cycle. When a client disconnects, the global set is rebuilt from the remaining clients' subscriptions. If no clients are connected (or no symbols are watched), the price fetch is skipped entirely.

---

## Frontend Integration

The WebSocket client is implemented as a Zustand store (`usePriceSocket`) that exposes:

- `connect(token)` -- Open the WebSocket connection.
- `disconnect()` -- Close the connection and stop reconnection.
- `subscribe(symbol)` -- Send a subscribe message.
- `unsubscribe(symbol)` -- Send an unsubscribe message.
- `prices` -- Record of the latest `PriceData` keyed by symbol.
- `connected` -- Boolean indicating connection status.
- `getPrice(symbol)` -- Helper to retrieve price data for a symbol.

The `useLivePrice(symbol)` hook returns the latest price from the store, or `undefined` to signal that the caller should fall back to a REST API request.

---

## Source Files

- Server: `backend/src/websocket/priceServer.ts`
- Client: `frontend/src/services/priceSocket.ts`
