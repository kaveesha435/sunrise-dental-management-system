# 🦷 Sunrise Dental — Clinic Appointment & Patient Management System

## Project Overview

Sunrise Dental is a professional, full-stack clinic management system built to streamline the daily operations of a dental clinic. It provides a robust, responsive, and secure platform for managing patients, scheduling appointments, maintaining dentist schedules, cataloging treatments, and handling billing and invoicing. The system is designed with a desktop-first approach but remains fully responsive across all devices.

## Features

- **Authentication:** Secure login for staff members using JWT-based authentication.
- **Dashboard:** At-a-glance overview of today's appointments, patient statistics, and quick actions.
- **Patient Management:** Complete CRUD operations for patient records, including contact information and medical notes.
- **Dentist Management:** Manage dentist profiles, specialties, and availability statuses.
- **Treatment Catalogue:** Maintain a list of standard dental procedures and their associated base costs.
- **Appointment Scheduling:** Book, reschedule, or cancel appointments. Prevents double-booking and checks dentist availability.
- **Billing & Invoicing:** Generate professional, printable receipts linking treatments, consultation fees, and patients.
- **Reports:** Generate analytical reports for clinic performance.
- **Help & Support:** Integrated help module for staff guidance.

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite |
| **Backend** | Java 17 · Spring Boot 3.2 · Spring Data JPA · Hibernate |
| **Database** | PostgreSQL 14+ |
| **Security** | Spring Security · JWT (JSON Web Tokens) · BCrypt |
| **HTTP Client** | Axios |
| **Routing** | React Router v7 |
| **UI Components** | Recharts · Custom Design System (Vanilla CSS) |
| **Testing** | JUnit 5 · Spring Boot Test · H2 (in-memory, test scope) |
| **Build** | Maven 3.9 · Vite 8 |

## Architecture

The system follows a classic decoupled client-server architecture:
- **Backend (Spring Boot):** Exposes a secure RESTful API. Uses a layered architecture consisting of Controllers (REST API), Services (Business Logic), Repositories (Data Access via Spring Data JPA), and Entities (Hibernate ORM models).
- **Frontend (React):** A Single Page Application (SPA) consuming the backend REST API. State is managed via React Context and Hooks. Styling is handled via a locked, strict vanilla CSS design system utilizing CSS variables (tokens).

## Project Structure

```text
sunrise-dental-management-system/
├── backend/                         ← Spring Boot REST API
│   ├── src/main/java/com/sunrisedental/
│   │   ├── controller/              ← REST API endpoints
│   │   ├── service/                 ← Business logic and transaction management
│   │   ├── repository/              ← Spring Data JPA interfaces
│   │   ├── entity/                  ← Database models (User, Patient, Dentist, etc.)
│   │   ├── dto/                     ← Data Transfer Objects for API requests/responses
│   │   ├── exception/               ← Global error handling
│   │   └── config/                  ← Security (JWT), CORS, and app configurations
│   └── src/main/resources/
│       └── application.properties   ← Backend configuration
│
└── frontend/                        ← React SPA
    ├── src/
    │   ├── api/                     ← Axios configuration (api.js)
    │   ├── components/              ← Reusable UI components (layout, common)
    │   ├── contexts/                ← React contexts (AuthContext)
    │   ├── hooks/                   ← Custom React hooks
    │   ├── pages/                   ← Route-level components
    │   ├── services/                ← API service modules (patientService, etc.)
    │   ├── styles/                  ← Global design system and component CSS
    │   └── utils/                   ← Helper functions (formatters)
    ├── package.json
    └── vite.config.js
```

## Database

The system uses **PostgreSQL** as its primary persistent data store.
The schema is managed automatically by Hibernate (`spring.jpa.hibernate.ddl-auto=update`), ensuring that tables and relationships are synchronized with the JPA entities without destroying existing data on application restart.

Core entities:
- `User`: Clinic staff and administrators.
- `Patient`: Patient demographics and contact details.
- `Dentist`: Dental practitioners and availability.
- `Treatment`: Catalogue of procedures and costs.
- `Appointment`: Scheduled visits linking Patient, Dentist, and Treatment.
- `Bill`: Financial records and invoices for appointments.

## API Overview

The backend exposes a secure REST API under `/api`. All endpoints (except login/health) require a valid JWT Bearer token.
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `GET /api/health`: Public health check endpoint.
- `/api/patients/*`: Patient CRUD and search.
- `/api/dentists/*`: Dentist CRUD and availability.
- `/api/treatments/*`: Treatment CRUD.
- `/api/appointments/*`: Appointment scheduling and conflict resolution.
- `/api/billing/*`: Bill calculation and invoice generation.

---

## Setup & Execution Instructions

### Prerequisites
- **Java 17–21** (JDK 22+ is not supported — Lombok fails to compile under it)
- **Maven 3.6+**
- **Node.js 18+** & **npm 9+**
- **PostgreSQL 14+**

### How to run PostgreSQL

Ensure your local PostgreSQL server is running. Create the required database and user:

```sql
CREATE DATABASE sunrise_dental;
CREATE USER sunrise_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sunrise_dental TO sunrise_user;
```
*(Note: Do not use production passwords in local development).*

### Environment Configuration

**Backend Configuration:**
Set the following environment variables in your terminal before running the backend, or rely on defaults if they match your setup.

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/sunrise_dental` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | *(Must be provided)* |
| `JWT_SECRET` | Secret for signing JWTs | *(Must be provided in prod)* |

**Frontend Configuration:**
The frontend uses a `.env` file located in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### How to run backend

```bash
cd backend
# Run the Spring Boot application
mvn spring-boot:run
```
The API will start on **http://localhost:8080**.

### How to run frontend

```bash
cd frontend
# Install dependencies
npm install
# Start the development server
npm run dev
```
The application will be accessible at **http://localhost:5173**.

### Testing Instructions

**Backend Tests:**
Tests are configured to use an H2 in-memory database, so PostgreSQL does not need to be running to execute the test suite.
```bash
cd backend
mvn test
```

### Sample Development Account

Once the application is running, you can log in using the default administrator account, which `DataSeeder` creates automatically on first startup:
- **Username:** `admin`
- **Email:** `admin@sunrisedental.lk`
- **Password:** `Admin@123`
*(Note: Change these credentials immediately in a production environment).*

---
*Sunrise Dental — Final Development Milestone.*
