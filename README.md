# QuickNotes Backend Platform

QuickNotes is a production-grade, 3-tier RESTful API service built for managing personal notes, tagging, and structured categories. Designed with high availability, relational data integrity, and fast read caching in mind.

---

## Architecture Overview

QuickNotes utilizes a decoupled, 3-tier architecture:

- **Client Tier:** Web frontends, mobile applications, or third-party HTTP API consumers.
- **API Tier (Node.js / Express):** Stateless RESTful backend handling authentication, payload validation, and request routing.
- **Persistence Tier (PostgreSQL & Redis):** PostgreSQL acts as the primary relational database maintaining ACID compliance, paired with Redis for low-latency in-memory query caching.

Detailed architectural specifications, layer descriptions, and sequence flows are documented in [`docs/architecture.md`](docs/architecture.md).

---

## Project Structure

```text
.
├── api.js                 # Production REST API client library
├── docs/                  # Technical documentation suite
│   ├── api-design.md      # REST API endpoints, examples & status codes
│   ├── data-model.md      # PostgreSQL DDL schema, ERD & indexing strategies
│   └── architecture.md    # 3-Tier architecture diagrams & scalability specs
├── package.json           # Node.js dependencies and scripts
└── README.md              # Project landing page & quick start guide
```

---

## Documentation Suite

- [API Design Specification](docs/api-design.md) — Comprehensive REST API endpoint reference, request/response JSON payloads, and standardized error response schemas.
- [Data Model Specification](docs/data-model.md) — PostgreSQL table definitions, foreign key constraint cascades, indexed access patterns, and SQL queries.
- [System Architecture Specification](docs/architecture.md) — End-to-end component topology, Redis caching strategy, stateless scaling, and security controls.

---

## API Client Usage Example (api.js)

The project includes a lightweight JavaScript API client (`api.js`) for consuming the QuickNotes backend services programmatically.

```javascript
const { QuickNotesClient } = require("./api");

// Initialize API Client
const client = new QuickNotesClient({
  baseUrl: "https://api.quicknotes.internal/v1",
  authToken: "YOUR_JWT_BEARER_TOKEN",
});

async function main() {
  try {
    // 1. Fetch user notes
    const notes = await client.getNotes();
    console.log("User Notes:", notes);

    // 2. Create a new note
    const newNote = await client.createNote({
      title: "Database Indexing Optimization",
      body: "Review composite B-tree index (user_id, created_at) performance in PostgreSQL.",
      tag_ids: [1, 2],
    });
    console.log("Created Note:", newNote);
  } catch (error) {
    console.error("API Error:", error.message);
  }
}

main();
```

---

## Quick Start & Setup

### Prerequisites

- Node.js: v18.x or higher
- PostgreSQL: v14.x or higher
- Redis: v7.x or higher

### Installation & Local Setup

1. **Clone Repository:**

   ```bash
   git clone https://github.com/your-username/quicknotes.git
   cd quicknotes
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/quicknotes_db
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Initialize Database Schema:**
   Apply the SQL DDL statements located in [docs/data-model.md](docs/data-model.md):

   ```bash
   psql $DATABASE_URL -f docs/data-model.md
   ```

5. **Start Server:**
   ```bash
   npm start
   ```

---

## License

This project is licensed under the MIT License.
