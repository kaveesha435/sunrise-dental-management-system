# 🦷 Sunrise Dental — Clinic Appointment & Patient Management System

A professional, full-stack clinic management system built as a university software engineering project.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Backend** | Java 17 · Spring Boot 3.2 · Spring Data JPA · Hibernate |
| **Database** | PostgreSQL |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **Testing** | JUnit 5 · Spring Boot Test · H2 (in-memory, test scope) |
| **Build** | Maven 3.9 · Vite 6 |

---

## Architecture

```
sunrise-dental-management-system/
├── backend/                         ← Spring Boot REST API
│   └── src/main/java/com/sunrisedental/
│       ├── controller/              ← REST controllers
│       ├── service/                 ← Business logic interfaces + implementations
│       ├── repository/              ← Spring Data JPA repositories
│       ├── entity/                  ← JPA entities (database models)
│       ├── dto/                     ← Request/Response DTOs (API surface)
│       ├── exception/               ← GlobalExceptionHandler, custom exceptions
│       └── config/                  ← CORS config, application config
│
└── frontend/                        ← React application
    └── src/
        ├── components/
        │   ├── layout/              ← AppShell, Sidebar, Topbar
        │   └── common/              ← Button, Input, Select, SearchBar,
        │                               DataTable, StatusBadge, StatCard,
        │                               Modal, ConfirmDialog, Toast,
        │                               EmptyState, LoadingState, ErrorState,
        │                               Pagination, FormSection, PageHeader
        ├── pages/                   ← One file per route
        ├── services/                ← Axios API clients (api.js + per-module services)
        ├── hooks/                   ← Custom React hooks (useToast, etc.)
        ├── utils/                   ← Shared helpers (formatters.js)
        ├── types/                   ← JSDoc type definitions
        └── styles/                  ← Global CSS design tokens (index.css)
```

---

## Running the Backend

### Prerequisites
- **Java 17+** (tested with JDK 21 and JDK 24)
- **Maven 3.6+** (`mvn` in PATH, or use the Maven binary directly)
- **PostgreSQL 14+** running locally

### PostgreSQL Setup

```sql
CREATE DATABASE sunrise_dental;
CREATE USER sunrise_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE sunrise_dental TO sunrise_user;
```

### Configuration

Set environment variables before running (or create a `.env` file for your shell):

```bash
# Windows PowerShell
$env:DB_URL      = "jdbc:postgresql://localhost:5432/sunrise_dental"
$env:DB_USERNAME = "sunrise_user"
$env:DB_PASSWORD = "yourpassword"
```

Alternatively, edit `backend/src/main/resources/application.properties` directly for local development — but do **not** commit credentials.

### Start the server

```bash
cd backend
mvn spring-boot:run
```

The API will be available at **http://localhost:8080**

### Health check

```
GET http://localhost:8080/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "service": "Sunrise Dental API",
    "status": "UP",
    "version": "1.0.0"
  },
  "timestamp": "2026-08-20T..."
}
```

### Run tests

```bash
cd backend
mvn test
```

Tests use an H2 in-memory database — **no PostgreSQL required to run tests**.

---

## Running the Frontend

### Prerequisites
- **Node.js 18+**
- **npm 9+**

### Install dependencies

```bash
cd frontend
npm install
```

### Configure API URL

The frontend reads the backend URL from `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

This file is already present at `frontend/.env` with the correct default.

### Start the dev server

```bash
cd frontend
npm run dev
```

The app will be available at **http://localhost:5173**

### Production build

```bash
cd frontend
npm run build
```

---

## Routes

| Route | Page | Status |
|---|---|---|
| `/login` | Login | Foundation |
| `/dashboard` | Dashboard | Foundation |
| `/patients` | Patients List | Placeholder |
| `/patients/new` | Register Patient | Placeholder |
| `/appointments` | Appointments | Placeholder |
| `/appointments/new` | Book Appointment | Placeholder |
| `/dentists` | Dentists | Placeholder |
| `/treatments` | Treatments Catalogue | Placeholder |
| `/billing` | Billing | Placeholder |
| `/billing/receipt` | Invoice/Receipt | Placeholder |
| `/reports` | Reports | Placeholder |
| `/help` | Help & Support | Placeholder |

---

## Design System

All design tokens are defined as CSS custom properties in `frontend/src/styles/index.css`.

| Token | Value |
|---|---|
| Primary | `#0F766E` |
| Primary Hover | `#115E59` |
| Deep Navy (Sidebar) | `#0F172A` |
| Page Background | `#F8FAFC` |
| Typography | Inter (Google Fonts) |
| Border Radius (inputs) | 8px |
| Border Radius (cards) | 12px |

---

## Development Status

### Commit 01 — Foundation ✅
- [x] Spring Boot project structure with clean package layout
- [x] PostgreSQL configuration via environment variables
- [x] `GET /api/health` endpoint with ApiResponse wrapper
- [x] Global exception handler
- [x] CORS configuration for React dev server
- [x] React + Vite frontend scaffold
- [x] Complete design token system (CSS custom properties)
- [x] 19 reusable UI components (AppShell, Sidebar, Topbar, Button, Input, Select, SearchBar, DataTable, StatusBadge, StatCard, Modal, ConfirmDialog, Toast, EmptyState, LoadingState, ErrorState, Pagination, FormSection, PageHeader)
- [x] All 12 routes wired with placeholder pages
- [x] Axios service layer with interceptors
- [x] Context-based Toast notification system

### Upcoming Commits
- [ ] Commit 02 — Authentication (JWT, login, protected routes)
- [ ] Commit 03 — Patient Management (CRUD)
- [ ] Commit 04 — Appointment Management
- [ ] Commit 05 — Dentist Management
- [ ] Commit 06 — Treatments Catalogue
- [ ] Commit 07 — Billing & Invoicing
- [ ] Commit 08 — Reports & Analytics

---

## Environment Variables Reference

### Backend
| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/sunrise_dental` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `server.port` | `8080` | API server port |

### Frontend
| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Backend API base URL |
