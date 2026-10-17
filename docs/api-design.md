# QuickNotes REST API Specification

This document details the production API design for the QuickNotes backend platform.

---

## REST Endpoints Summary

| Method   | Path                | Description                                   | Success Status              |
| :------- | :------------------ | :-------------------------------------------- | :-------------------------- |
| `GET`    | `/api/v1/notes`     | Retrieve all notes for the authenticated user | `200 OK`                    |
| `POST`   | `/api/v1/notes`     | Create a new note                             | `201 Created`               |
| `GET`    | `/api/v1/notes/:id` | Fetch details of a specific note              | `200 OK`                    |
| `PUT`    | `/api/v1/notes/:id` | Update an existing note completely            | `200 OK`                    |
| `DELETE` | `/api/v1/notes/:id` | Permanently remove a note                     | `200 OK` / `204 No Content` |
| `GET`    | `/api/v1/tags`      | List all tags associated with user notes      | `200 OK`                    |

---

## Request & Response Examples

### 1. Create a Note (`POST /api/v1/notes`)

**Request Payload:**

```json
{
  "title": "System Design Architecture Notes",
  "body": "Ensure read replicas and Redis caching layers are detailed in docs/architecture.md.",
  "tag_ids": [1, 4]
}
```

**Response Payload (`201 Created`):**

```json
{
  "id": 101,
  "user_id": 42,
  "title": "System Design Architecture Notes",
  "body": "Ensure read replicas and Redis caching layers are detailed in docs/architecture.md.",
  "created_at": "2026-10-17T18:00:00Z",
  "updated_at": "2026-10-17T18:00:00Z",
  "tags": [
    { "id": 1, "name": "Architecture" },
    { "id": 4, "name": "Study" }
  ]
}
```

---

### 2. List Notes (GET /api/v1/notes)

**Response Payload (`200 OK`):**

```json
{
  "page": 1,
  "limit": 10,
  "total": 1,
  "data": [
    {
      "id": 101,
      "user_id": 42,
      "title": "System Design Architecture Notes",
      "body": "Ensure read replicas and Redis caching layers are detailed in docs/architecture.md.",
      "created_at": "2026-10-17T18:00:00Z",
      "updated_at": "2026-10-17T18:00:00Z"
    }
  ]
}
```

---

## HTTP Error Status Codes

The QuickNotes API standardizes on standard HTTP status codes to communicate client and server operational states:

* **`400 Bad Request`**: Validation failure (e.g., missing title or title exceeding 100 characters).
* **`401 Unauthorized`**: Authentication token missing, expired, or invalid.
* **`403 Forbidden`**: Authenticated user lacks permission to access or modify the specified resource.
* **`404 Not Found`**: The requested note or resource ID does not exist.
* **`500 Internal Server Error`**: Unhandled system exception or database connectivity issue.

### Example Error Response Body (400 Bad Request)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must not exceed 100 characters.",
    "details": [
      {
        "field": "title",
        "issue": "Title length exceeds the maximum allowed limit of 100 characters."
      }
    ]
  }
}
```
