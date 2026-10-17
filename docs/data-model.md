# QuickNotes Data Model & Database Specification

This document defines the relational database architecture and data model for the production QuickNotes platform.

---

## 1. Entity Descriptions & Relationships

The QuickNotes system consists of four primary domain entities:

1. **`users`**: Represents registered platform accounts.
2. **`notes`**: Stores user-generated note entries containing title and body content.
3. **`tags`**: Categorical labels created by users to organize notes.
4. **`note_tags`**: Join table managing the many-to-many relationship between notes and tags.

### Relationships

- **User to Notes (`1:N`)**: One user can own multiple notes. Each note belongs to exactly one user (`notes.user_id` $\rightarrow$ `users.id`).
- **Notes to Tags (`M:N`)**: A note can have multiple tags, and a tag can be applied to multiple notes via `note_tags`.

---

## 2. DDL Schema Definition (`CREATE TABLE` Statements)

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notes Table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(name, user_id)
);

-- Note Tags (Join Table for M:N Relationship)
CREATE TABLE note_tags (
    note_id INT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

---

## 3. Example Queries

### Query 1: Fetch all notes for a specific user ordered by creation date

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 42
ORDER BY created_at DESC;
```

### Query 2: Retrieve notes along with their associated tags (JOIN Query)

```sql
SELECT
    n.id AS note_id,
    n.title,
    n.body,
    t.name AS tag_name
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
JOIN tags t ON nt.tag_id = t.id
WHERE n.user_id = 42;
```

### Query 3: Search notes by keyword in title or body

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 42
  AND (title ILIKE '%architecture%' OR body ILIKE '%architecture%');
```

---

## 4. Database Indexing Strategy

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
```

### Justification for Composite Index (idx_notes_user_created)

The composite index `(user_id, created_at DESC)` directly supports the primary access pattern of QuickNotes: querying a specific user's notes sorted by recency (`WHERE user_id = ? ORDER BY created_at DESC`). Placing `user_id` first allows the B-tree to isolate the user's data range, and appending `created_at DESC` eliminates the need for an in-memory sort operation (filesort).

---

## 5. Architectural Decision: SQL vs. NoSQL

**Decision:** PostgreSQL (Relational SQL)

**Rationale:**

1. **ACID Transactions & Data Integrity:** Strict foreign key constraints guarantee that deleting a user or tag cleanly handles dependent records via cascade rules without leaving orphaned rows.
2. **Relational Structure:** Notes, users, and tags exhibit a clear relational shape with many-to-many joins (`note_tags`). Relational joins match this data domain far more naturally than document-level nesting or denormalization.
3. **Structured Querying:** Future requirements (such as tag filtering, user metrics, and full-text search) are natively optimized in PostgreSQL without requiring complex map-reduce or manual application-side data aggregation.
