# InvestEd API Documentation

Base URL: `/api/v1`

All authenticated endpoints require `Authorization: Bearer <token>` header.

---

## Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Returns `{ status: "ok", timestamp }` |

---

## Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register with .edu email |
| POST | `/auth/login` | No | Login, returns access + refresh tokens |
| POST | `/auth/logout` | Yes | Invalidate refresh token |
| POST | `/auth/refresh` | No | Refresh access token |
| GET | `/auth/verify/:token` | No | Verify email from link |
| POST | `/auth/resend-verification` | No | Resend verification email |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password` | No | Reset password with token |

### POST `/auth/register`
```json
{
  "email": "user@university.edu",
  "password": "Min8chars!",
  "firstName": "John",
  "lastName": "Doe"
}
```
Returns: `201` with success message. Creates user + default $10,000 portfolio.

### POST `/auth/login`
```json
{ "email": "user@university.edu", "password": "password" }
```
Returns: `{ accessToken, refreshToken, user: { id, email, firstName, lastName } }`

---

## User (`/api/v1/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Yes | Get current user info |
| GET | `/users/profile` | Yes | Get user profile |
| PUT | `/users/profile` | Yes | Update profile |
| PUT | `/users/change-password` | Yes | Change password |

---

## Portfolio (`/api/v1/portfolio`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/portfolio` | Yes | Get portfolio with positions |
| GET | `/portfolio/positions` | Yes | Get all open positions |
| GET | `/portfolio/transactions` | Yes | Get transaction history |
| GET | `/portfolio/history` | Yes | Get portfolio value over time |
| POST | `/portfolio/reset` | Yes | Reset portfolio to $10,000 |

### GET `/portfolio`
Returns:
```json
{
  "id": "uuid",
  "name": "Default",
  "cashBalance": 10000,
  "positions": [
    {
      "id": "uuid",
      "symbol": "AAPL",
      "quantity": 2,
      "avgCost": 5.50,
      "positionType": "OPTION",
      "optionType": "CALL",
      "strikePrice": 200,
      "expirationDate": "2026-05-16",
      "contractSymbol": "O:AAPL260516C00200000",
      "status": "OPEN"
    }
  ]
}
```

### GET `/portfolio/history?period=30d`
Query params: `period` — `7d`, `30d`, `90d`, `1y`, `all`

---

## Stocks (`/api/v1/stocks`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stocks/search?q=AAPL` | Yes | Search stocks by query |
| GET | `/stocks/:symbol` | Yes | Get ticker details |
| GET | `/stocks/:symbol/price` | Yes | Get current price (OHLCV) |
| GET | `/stocks/:symbol/history` | Yes | Get historical price bars |

### GET `/stocks/:symbol/price`
Returns:
```json
{
  "symbol": "AAPL",
  "open": 198.50,
  "high": 201.30,
  "low": 197.80,
  "close": 200.25,
  "volume": 52340000,
  "vwap": 199.85,
  "timestamp": 1713600000000
}
```

### GET `/stocks/:symbol/history?from=2026-03-01&to=2026-04-01&timespan=day`
Query params: `from`, `to`, `timespan` (`day`, `hour`, `minute`)

---

## Options (`/api/v1/options`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/options/chain/:symbol` | Yes | Get full options chain |
| GET | `/options/contracts/:symbol` | Yes | Get options contracts |

### GET `/options/chain/:symbol`
Returns calls and puts organized by strike price and expiration.

---

## Trading (`/api/v1/trade`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/trade/options/buy` | Yes | Buy options contract |
| POST | `/trade/options/sell` | Yes | Sell options contract |
| GET | `/trade/options/price` | Yes | Get theoretical option price |

### POST `/trade/options/buy`
```json
{
  "symbol": "AAPL",
  "contractSymbol": "O:AAPL260516C00200000",
  "optionType": "CALL",
  "strikePrice": 200,
  "expirationDate": "2026-05-16",
  "quantity": 1,
  "price": 5.50
}
```
Returns: `201` with `{ position, transaction, cashBalance }`.
Price is validated against theoretical Black-Scholes value (±25-50% tolerance).
First trade for new users is a demo (no real cash impact).

### POST `/trade/options/sell`
Same body format as buy. Returns `200` with `{ position, transaction, cashBalance }`.

### GET `/trade/options/price?symbol=AAPL&strikePrice=200&expirationDate=2026-05-16&optionType=CALL`
Returns: `{ theoreticalPrice, stockPrice, iv }`

---

## Education (`/api/v1/education`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/education/modules` | Yes | List all modules with completion status |
| GET | `/education/modules/:id` | Yes | Get single module |
| POST | `/education/modules/:id/complete` | Yes | Mark module as completed |

Modules are sequential — module N is locked until module N-1 is completed.

---

## Notifications (`/api/v1/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | Get all notifications |
| PATCH | `/notifications/:id/read` | Yes | Mark notification as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/notifications/:id` | Yes | Delete notification |

---

## Error Responses

All errors return:
```json
{
  "error": "Error message",
  "stack": "..." // development only
}
```

Common status codes:
- `400` — Validation error or bad request
- `401` — Unauthorized (missing/invalid token)
- `404` — Resource not found
- `409` — Conflict (e.g., duplicate email)
- `429` — Rate limited
- `500` — Internal server error
