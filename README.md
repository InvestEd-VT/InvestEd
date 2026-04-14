# InvestEd

An options-focused investment learning platform for college students. Practice trading with virtual money, learn through interactive modules, and compete with friends.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS
- Zustand
- React Router

### Backend

- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd InvestEd
```

2. Install dependencies

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

3. Set up environment variables

```bash
# Copy the example env file
cp .env.example backend/.env
```

4. Start the database services

```bash
docker compose up -d
```

5. Generate Prisma client, run migrations, and seed db

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
```

6. Start the development servers

In separate terminals:

```bash
# Terminal 1 - Backend (http://localhost:5001)
cd backend && npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend && npm run dev
```

## Production

### Local Production Testing with Docker

To test the full production setup locally using Docker Compose:

1. Copy the production env example and fill in values

```bash
cp .env.prod.example .env.prod
```

2. Build and start all services

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build
```

3. Verify the backend is running

```bash
curl http://localhost:5001/health
```

4. Open the frontend at `http://localhost:80`

5. Stop all services

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod down
```

> **Note:** On WSL2, ports may not forward to Windows localhost automatically. The health check logs inside Docker confirm the backend is running correctly regardless of browser access.

## Available Commands

#### Root

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run docker:up`    | Start PostgreSQL and Redis containers |
| `npm run docker:down`  | Stop database containers              |
| `npm run dev:frontend` | Start frontend dev server             |
| `npm run dev:backend`  | Start backend dev server              |

#### Frontend

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start development server on port 3000 |
| `npm run build`   | Build for production                  |
| `npm run lint`    | Run ESLint                            |
| `npm run preview` | Preview production build              |

#### Backend

| Command                   | Description                           |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Start development server on port 5001 |
| `npm run build`           | Compile TypeScript                    |
| `npm run start`           | Run compiled JavaScript               |
| `npm run test`            | Run tests with Vitest                 |
| `npm run prisma:generate` | Generate Prisma client                |
| `npm run prisma:migrate`  | Run database migrations               |
| `npx prisma db seed`      | Seed database                         |
| `npm run prisma:studio`   | Open Prisma Studio                    |

## API Endpoints

- Health check: `GET http://localhost:5001/health`

## Generating Strong Secrets

Use this command to generate secure JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run it twice — once for `JWT_SECRET` and once for `JWT_REFRESH_SECRET`.

## Project Structure

```
InvestEd/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── app/                # App-level routes and layouts
│   │   │   ├── dashboard/      # Dashboard route
│   │   │   └── education/      # Education route
│   │   ├── assets/             # Static assets
│   │   ├── components/         # UI components
│   │   │   ├── common/         # Shared components
│   │   │   ├── education/      # Education components
│   │   │   │   └── modules/    # Individual education modules
│   │   │   ├── layout/         # Layout components
│   │   │   ├── portfolio/      # Portfolio components
│   │   │   ├── trading/        # Trading components
│   │   │   └── ui/             # Base UI primitives
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Third party library config
│   │   ├── pages/              # Route pages
│   │   ├── services/           # API client functions
│   │   ├── store/              # Zustand state management
│   │   ├── test/               # Test utilities and setup
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   └── ...
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Route handlers
│   │   ├── jobs/               # Cron jobs (snapshots, expiration)
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   │   └── v1/             # Versioned API routes
│   │   ├── scripts/            # One-time utility scripts
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   ├── validators/         # Input validation schemas
│   │   └── __tests__/          # Backend tests
│   ├── prisma/                 # Database schema, migrations, and seed files
│   └── ...
├── .github/                    # GitHub Actions workflows
├── docker-compose.yml          # Local development database services
├── docker-compose.prod.yml     # Production Docker Compose configuration
├── .env.prod.example           # Production environment variable template
└── ...
```

## Team

### Frontend

- Andrew Hand
- Kevin Alegre
- Noa Nelson

### Backend

- Lucas Umberger
- Brendan Neely
- Federico Tafur

### API/Testing

- Vignesh Yampally
