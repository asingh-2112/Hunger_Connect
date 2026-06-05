# Hunger Connect — Monorepo

Full-stack food donation platform connecting donors with NGOs.

**Host URL:** [https://hunger-connect-three.vercel.app/](https://hunger-connect-three.vercel.app/)

```
Hunger_Connect/
├── backend/    # Spring Boot 3.x REST API (Java 21 + PostgreSQL)
└── frontend/   # React 19 SPA (Vite + MUI + Tailwind)
```

## Stack

| Layer       | Backend                          | Frontend                  |
|-------------|----------------------------------|---------------------------|
| Language    | Java 21                          | JavaScript (React 19)     |
| Framework   | Spring Boot 3.x                  | Vite + MUI + Tailwind CSS |
| Database    | PostgreSQL 16 + Flyway           | —                         |
| Auth        | Spring Security + JWT            | Axios interceptors + useAuth |
| Storage     | MinIO (dev) / AWS S3 (prod)      | —                         |
| State       | —                                | React Query (@tanstack)   |
| Deploy      | Railway (Docker)                 | Vercel                    |

## Quick Start (local)

### 1. Start infrastructure
```bash
docker compose up postgres minio -d
```

### 2. Run backend
```bash
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### 3. Run frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

## CI/CD

- `.github/workflows/backend-ci.yml` — test → build Docker → deploy Railway  
- `.github/workflows/frontend-ci.yml` — lint → build → deploy Vercel

## Deployment

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for details.
