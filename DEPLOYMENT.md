# InvestEd -- Railway Deployment Runbook

This document covers deploying, monitoring, and troubleshooting InvestEd on Railway.

---

## Architecture

InvestEd runs as three Railway services:

| Service    | Type            | Details                                                      |
| ---------- | --------------- | ------------------------------------------------------------ |
| Frontend   | Static SPA      | React + Vite, served via Dockerfile (nginx or static server) |
| Backend    | Node.js         | Express + TypeScript + Prisma, built with Nixpacks           |
| PostgreSQL | Managed DB      | Railway-provisioned PostgreSQL instance                       |

---

## Production URLs

| Service  | URL                                                        |
| -------- | ---------------------------------------------------------- |
| Frontend | https://frontend-production-bf88.up.railway.app            |
| Backend  | https://backend-production-7416.up.railway.app             |

---

## Railway Config Files

### Backend (`backend/railway.json`)

- **Builder:** Nixpacks
- **Build command:** `npx prisma generate && npm run build`
- **Start command:** `npx prisma migrate deploy && node dist/server.js`
- **Health check:** `GET /health` (30s timeout)
- **Restart policy:** On failure, max 3 retries

### Frontend (`frontend/railway.toml`)

- **Builder:** Dockerfile
- **Health check:** `GET /` (30s timeout)
- **Restart policy:** On failure, max 3 retries

---

## How to Deploy

### Using the Railway CLI

Deploy from the appropriate service directory:

```bash
# Deploy backend
cd backend/
railway up

# Deploy frontend
cd frontend/
railway up
```

Each command builds and deploys the service according to its Railway config file.

### Via Git Push

If your Railway project is linked to a GitHub repository, pushing to the configured branch triggers automatic deployment.

---

## Environment Variables

The following environment variables must be set in Railway for each service. See `.env.example` for reference values.

### Backend

| Variable           | Description                                  | Example                                      |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| `NODE_ENV`         | Runtime environment                          | `production`                                 |
| `PORT`             | Server port (Railway sets this automatically)| `5001`                                       |
| `FRONTEND_URL`     | Frontend origin for CORS and email links     | `https://frontend-production-bf88.up.railway.app` |
| `BACKEND_URL`      | Backend base URL                             | `https://backend-production-7416.up.railway.app`  |
| `ALLOWED_ORIGINS`  | Comma-separated CORS origins                 | `https://frontend-production-bf88.up.railway.app` |
| `DATABASE_URL`     | PostgreSQL connection string                 | Provided by Railway PostgreSQL plugin        |
| `REDIS_URL`        | Redis connection string                      | `redis://...`                                |
| `JWT_SECRET`       | Access token signing key (64+ chars)         | Random hex string                            |
| `JWT_REFRESH_SECRET` | Refresh token signing key (64+ chars)      | Different random hex string                  |
| `MASSIVE_API_KEY`  | API key for stock/options data               | From Massive API dashboard                   |
| `MASSIVE_API_BASE` | Massive API base URL                         | `https://api.massive.com`                    |
| `EMAIL_USER`       | Gmail address for verification emails        | `noreply@example.com`                        |
| `EMAIL_PASS`       | Gmail App Password                           | App-specific password                        |

### Frontend

The frontend is a static build. Environment variables are baked in at build time using Vite's `VITE_` prefix convention. Configure these as Railway build variables:

| Variable         | Description              | Example                                           |
| ---------------- | ------------------------ | ------------------------------------------------- |
| `VITE_API_URL`   | Backend API base URL     | `https://backend-production-7416.up.railway.app`  |
| `VITE_WS_URL`    | WebSocket server URL     | `wss://backend-production-7416.up.railway.app`    |

---

## Database Migrations

Migrations run automatically on each backend deploy via the start command (`npx prisma migrate deploy`). To run migrations manually:

```bash
railway run -- npx prisma migrate deploy
```

This executes the command inside Railway's environment with the correct `DATABASE_URL`.

---

## Seeding the Database

To seed the database (e.g., education modules, default data):

```bash
DATABASE_URL=<railway-public-database-url> npx tsx prisma/seed.ts
```

You can find the public database URL in the Railway dashboard under your PostgreSQL service's connection settings.

---

## Checking Logs

View real-time logs for a service:

```bash
railway logs
```

Run this from the directory linked to the service you want to inspect, or use the Railway dashboard for a web-based log viewer.

---

## Rollback

Railway does not have a built-in single-command rollback. To revert a bad deployment:

1. **Take the service down** (optional, if the deployment is causing errors):

   ```bash
   railway down
   ```

2. **Revert the code** to the last known good state (e.g., `git revert` or `git checkout`).

3. **Redeploy:**

   ```bash
   railway up
   ```

Alternatively, use the Railway dashboard to redeploy a previous successful deployment from the deployment history.

---

## Common Issues and Fixes

### Build fails with Prisma errors

**Symptom:** `prisma generate` fails during build.

**Fix:** Make sure `prisma` and `@prisma/client` are in `dependencies` (not just `devDependencies`) in `package.json`, since Nixpacks only installs production dependencies by default.

### Health check fails after deploy

**Symptom:** Railway marks the deployment as failed because the health check times out.

**Fix:**
- Backend: Ensure your Express app exposes a `GET /health` endpoint that returns a 200 status.
- Frontend: Ensure the Dockerfile serves content at `/`.
- Check that the `PORT` environment variable is being used correctly (Railway assigns the port dynamically).

### Database connection refused

**Symptom:** `ECONNREFUSED` or timeout errors when connecting to PostgreSQL.

**Fix:**
- Verify `DATABASE_URL` is set in the Railway service variables.
- Use the internal Railway hostname (not the public URL) for service-to-service communication.
- Check that the PostgreSQL plugin is attached to the backend service.

### CORS errors in browser

**Symptom:** Frontend requests to the backend are blocked by CORS.

**Fix:** Ensure `FRONTEND_URL` and `ALLOWED_ORIGINS` in the backend service variables include the exact frontend production URL (with `https://`, no trailing slash).

### WebSocket connection fails

**Symptom:** Frontend cannot establish a WebSocket connection.

**Fix:**
- Ensure `VITE_WS_URL` uses `wss://` (not `ws://`) for the production backend URL.
- Verify the backend is listening on the `/prices` path.
- Check that the JWT token being sent is valid and not expired.

### Migrations fail on deploy

**Symptom:** The start command fails at `npx prisma migrate deploy`.

**Fix:**
- Check `railway logs` for the specific migration error.
- If a migration is stuck, you may need to manually resolve it using `railway run -- npx prisma migrate resolve --rolled-back <migration-name>`.
