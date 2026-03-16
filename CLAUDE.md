# Claude Code Guidelines

## Git Commits
- Never add "Co-Authored-By: Claude" to commit messages
- Do not include Claude as a collaborator in any commits

## Project Overview
This is a monorepo for InvestEd, an investment education platform for college students.

### Structure
- `frontend/` - React + Vite + TypeScript + TailwindCSS
- `backend/` - Express + TypeScript + Prisma

### Commands
- Frontend dev: `cd frontend && npm run dev` (port 3000)
- Backend dev: `cd backend && npm run dev` (port 5001)
- Docker: `docker compose up -d` (PostgreSQL + Redis)
