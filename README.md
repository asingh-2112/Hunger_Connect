# Hunger Connect — Spring Boot REST API Backend

Spring Boot 3.x REST API backend for the Hunger Connect platform.

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Language   | Java 21 (virtual threads)               |
| Framework  | Spring Boot 3.4.x                       |
| Database   | PostgreSQL 16 + Spring Data JPA         |
| Migrations | Flyway                                  |
| Security   | Spring Security + JWT (jjwt 0.12.x)     |
| Storage    | MinIO (dev) / AWS S3 (prod)             |
| Email      | Spring Mail + Resend                    |
| Docs       | SpringDoc OpenAPI / Swagger UI          |
| Tests      | JUnit 5 + Mockito + Testcontainers      |

## Running Locally

### Prerequisites
- Java 21+
- Maven 3.9+
- Docker (for PostgreSQL + MinIO)

### Start infrastructure

```bash
# From project root (one level up)
docker compose up postgres minio -d
```

### Run the application

```bash
cd Hunger_Connect
./mvnw spring-boot:run
```

API will be available at `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

## Environment Variables

| Variable             | Default                          | Description               |
|----------------------|----------------------------------|---------------------------|
| `DB_URL`             | `jdbc:postgresql://localhost:...`| PostgreSQL JDBC URL       |
| `DB_USERNAME`        | `postgres`                       | DB username               |
| `DB_PASSWORD`        | `postgres`                       | DB password               |
| `JWT_SECRET`         | *(change in prod!)*              | JWT signing secret        |
| `JWT_ACCESS_EXPIRY`  | `900000` (15 min)                | Access token TTL (ms)     |
| `JWT_REFRESH_EXPIRY` | `604800000` (7 days)             | Refresh token TTL (ms)    |
| `S3_ENDPOINT`        | `http://localhost:9000`          | S3/MinIO endpoint         |
| `S3_ACCESS_KEY`      | `minioadmin`                     | S3 access key             |
| `S3_SECRET_KEY`      | `minioadmin`                     | S3 secret key             |
| `S3_BUCKET`          | `hunger-connect`                 | S3 bucket name            |
| `MAIL_HOST`          | `smtp.resend.com`                | SMTP host                 |
| `MAIL_PASSWORD`      | *(set in prod)*                  | SMTP password / API key   |
| `FRONTEND_URL`       | `http://localhost:5173`          | Used in password reset links |

## API Endpoints

| Method | Path                          | Auth     | Description                  |
|--------|-------------------------------|----------|------------------------------|
| POST   | `/api/auth/register`          | Public   | Register new user            |
| POST   | `/api/auth/login`             | Public   | Login, get tokens            |
| POST   | `/api/auth/refresh`           | Public   | Refresh access token         |
| POST   | `/api/auth/forgot-password`   | Public   | Send password reset email    |
| POST   | `/api/auth/reset-password`    | Public   | Reset password via token     |
| GET    | `/api/users/me`               | Bearer   | Get current user profile     |
| PUT    | `/api/users/me`               | Bearer   | Update profile               |
| GET    | `/api/donations`              | Public   | List pending donations       |
| POST   | `/api/donations`              | PROVIDER | Create donation              |
| POST   | `/api/donations/{id}/accept`  | DISTRIBUTOR | Accept donation           |
| POST   | `/api/donations/{id}/withdraw`| DISTRIBUTOR | Withdraw acceptance       |
| POST   | `/api/donations/{id}/complete`| Bearer   | Mark complete                |
| POST   | `/api/donations/rate`         | Bearer   | Rate completed donation      |
| GET    | `/api/blogs`                  | Public   | List blog posts              |
| POST   | `/api/blogs`                  | Bearer   | Create blog post             |
| POST   | `/api/blogs/{id}/like`        | Bearer   | Toggle like                  |
| POST   | `/api/blogs/{id}/comments`    | Bearer   | Add comment                  |
| POST   | `/api/files/upload`           | Bearer   | Upload image → S3/MinIO      |

## Running Tests

```bash
./mvnw test
```

Integration tests use Testcontainers and spin up a real PostgreSQL container.

## Docker Build

```bash
docker build -t hunger-connect-backend .
```
