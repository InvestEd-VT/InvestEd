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

5. Generate Prisma client and run migrations
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

6. Start the development servers

In separate terminals:
```bash
# Terminal 1 - Backend (http://localhost:5001)
cd backend && npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend && npm run dev
```

### Available Commands

#### Root
| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start PostgreSQL and Redis containers |
| `npm run docker:down` | Stop database containers |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run dev:backend` | Start backend dev server |

#### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

#### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5001 |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled JavaScript |
| `npm run test` | Run tests with Vitest |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |

### API Endpoints

- Health check: `GET http://localhost:5001/health`

## Project Structure

```
InvestEd/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # Custom React hooks
│   │   ├── store/      # Zustand state management
│   │   ├── services/   # API client functions
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utility functions
│   └── ...
├── backend/            # Express + TypeScript API
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Route handlers
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utility functions
│   ├── prisma/         # Database schema
│   └── ...
├── docker-compose.yml  # Database services
└── ...
```

## Team

### Frontend
- Andrew Hand
- Kevin Alegre
- Noa

### Backend
- Lucas Berger
- Brendan Neely
- Federico Tafur

### API/Testing
- Vignesh Yampally
