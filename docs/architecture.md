# QuickNotes System Architecture & Design Specification

This document details the system architecture, component relationships, scalability strategy, and security model for the QuickNotes production platform.

---

## 1. System Overview & Architecture Diagram

QuickNotes employs a classic **3-Tier Architecture** consisting of a Client Layer, API Server Layer, and Data Persistence Layer.

```text
+-------------------------------------------------------+
| Client Layer                                          |
| (Browser / Web App / Mobile / Third-Party Consumer)   |
+---------------------------+---------------------------+
                            |
                            | HTTPS / REST API
                            v
+-------------------------------------------------------+
| API Server Layer                                      |
| (Node.js / Express)                                   |
| +-------------------------------------------------+   |
| | Middleware: Auth (JWT), Rate Limiting, CORS     |   |
| +-------------------------------------------------+   |
| | Controllers: AuthController, NoteController     |   |
| +-------------------------------------------------+   |
| | Data Access Layer: ORM / SQL Query Builder      |   |
| +-------------------------------------------------+   |
+---------------------------+---------------------------+
                            |
              +-------------+-------------+
              |                           |
              v                           v
+--------------------------------+ +--------------------+
| Primary Database Layer         | | Caching Layer      |
| (PostgreSQL Relational DB)     | | (Redis)            |
+--------------------------------+ +--------------------+
```

---

## 2. Layer Definitions & Component Breakdown

### Client Layer

- **Role:** Serves single-page applications (SPAs), web interfaces, and mobile clients.
- **Responsibilities:** Renders UI components, maintains application state, sends asynchronous HTTP requests (`fetch`/`axios`) with JWT Bearer tokens, and handles validation error states gracefully.

### API Server Layer (Node.js / Express)

- **Middleware Pipeline:**
  - **CORS Middleware:** Enforces origin rules and restricts unauthorized client origins.
  - **Rate Limiter:** Prevents Denial of Service (DoS) attacks by limiting request rates per IP/User.
  - **Authentication Handler:** Validates JWT signature and injects user identity into request contexts (`req.user`).
  - **Request Validator:** Sanitizes and validates request payload bodies before business logic processing.
- **Controller / Service Layer:** Executes application logic, enforces business domain constraints, and interfaces with storage layers.

### Data & Caching Layers

- **PostgreSQL Primary Database:** Stores canonical relational data (`users`, `notes`, `tags`, `note_tags`) ensuring ACID transactional safety.
- **Redis Cache:** In-memory key-value store used to cache frequently read data (e.g., user profiles, hot notes) and session/token revocation blacklists to reduce database read load.

---

## 3. Data Flow

### Sequence: Creating a New Note (`POST /api/v1/notes`)

1. **Client Request:** The user submits a new note form. The client issues a `POST /api/v1/notes` request containing JSON payload and `Authorization: Bearer <JWT>` header.
2. **Authentication Check:** Express middleware verifies the JWT token signature. If invalid or expired, returns `401 Unauthorized`.
3. **Payload Validation:** The request body is validated against schema limits (e.g., title $\le$ 100 characters). If invalid, returns `400 Bad Request`.
4. **Database Insertion:** The Controller executes an `INSERT INTO notes` SQL query via connection pool.
5. **Cache Invalidation:** The Controller invalidates relevant user cache keys in Redis (e.g., `user:42:notes_page_*`).
6. **Client Response:** The API returns a `201 Created` status with the complete saved note JSON object.

---

## 4. Scalability, Caching & Performance Strategy

- **Read Replicas:** Scale PostgreSQL read capacity by attaching horizontal read-only replicas using asynchronous replication for high-frequency read queries (`SELECT`).
- **In-Memory Caching (Redis):** Caches popular user feeds and metadata. Uses Cache-Aside pattern with a Time-To-Live (TTL) expiration strategy (e.g., 5-15 minutes).
- **Stateless API Tier:** The Node.js API instances maintain no local session state, allowing seamless horizontal autoscaling behind an AWS ALB or NGINX load balancer.
- **Database Connection Pooling:** Utilizes connection pooling (`pg-pool`) to reuse database connections, preventing connection exhaustion under heavy concurrent traffic.

---

## 5. Security & Authentication Model

- **Authentication:** Stateless **JSON Web Tokens (JWT)** signed using HMAC-SHA256 (`HS256`) or RSA key pairs with short expiration times (e.g., 15 minutes) paired with secure refresh tokens.
- **Password Storage:** Passwords hashed using **bcrypt** (cost factor $\ge 12$) or **Argon2id** before saving to `users.password_hash`.
- **Data Sanitization & Injection Prevention:** Uses parameterized SQL queries to completely mitigate SQL injection vectors.
- **Transport Security:** All communication enforced over **TLS 1.3 / HTTPS** in transit.
