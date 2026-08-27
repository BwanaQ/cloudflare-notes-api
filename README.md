# Cloudflare Notes API

A serverless CRUD API built with **Cloudflare Workers**, **Cloudflare D1**, and **Workers KV**.

The project demonstrates building a production-style API using Cloudflare's edge platform with automated testing through Vitest and GitHub Actions.


📚 Interactive OpenAPI documentation:

https://notes-api-docs.pages.dev/
---

## Features

- ⚡ Cloudflare Workers serverless API
- 🗄️ Cloudflare D1 SQLite database
- 🚀 Workers KV caching layer
- ✅ Full CRUD operations for notes
- 🧪 Automated integration tests with Vitest
- 🔄 GitHub Actions CI pipeline
- 📦 TypeScript support
- 🌍 Edge deployment ready

---

## Architecture

```

```
             Client
               |
               |
               v
      Cloudflare Worker
               |
    +----------+----------+
    |                     |
    v                     v
```

Cloudflare D1          Workers KV
Database              Cache Layer

```

### Request Flow

1. Client sends API request.
2. Cloudflare Worker handles routing.
3. Worker reads/writes data from D1.
4. Frequently accessed note lists are cached using Workers KV.
5. Cache is invalidated after create, update, or delete operations.

---

# API Endpoints

## Health Check

### GET

```

/api/health

````

Example response:

```json
{
  "status": "ok"
}
````

---

# Notes API

## Get All Notes

### GET

```
/api/notes
```

Response:

```json
[
  {
    "id": 1,
    "title": "Cloudflare D1",
    "content": "My first serverless database",
    "created_at": "2026-08-27"
  }
]
```

Cache headers:

```
X-Cache: MISS
```

First request retrieves data from D1.

Subsequent requests:

```
X-Cache: HIT
```

retrieve data from Workers KV.

---

## Create Note

### POST

```
/api/notes
```

Request body:

```json
{
  "title": "My note",
  "content": "Testing Cloudflare Workers"
}
```

Response:

```json
{
  "id": 1,
  "title": "My note",
  "content": "Testing Cloudflare Workers"
}
```

---

## Get Note By ID

### GET

```
/api/notes/:id
```

Example:

```
/api/notes/1
```

---

## Update Note

### PUT

```
/api/notes/:id
```

Request:

```json
{
  "title": "Updated title",
  "content": "Updated content"
}
```

---

## Delete Note

### DELETE

```
/api/notes/:id
```

Example:

```
/api/notes/1
```

Response:

```json
{
  "message": "Note deleted successfully"
}
```

---

# Local Development

## Requirements

* Node.js 20+
* Cloudflare account
* Wrangler CLI

Install dependencies:

```bash
npm install
```

---

## Generate Cloudflare Types

```bash
npm run cf-typegen
```

---

## Run Development Server

```bash
npm run dev
```

The API will be available at:

```
http://localhost:8787
```

---

# Database Setup

Apply D1 migrations locally:

```bash
npx wrangler d1 migrations apply notes-db --local
```

Check tables:

```bash
npx wrangler d1 execute notes-db --local \
--command "SELECT name FROM sqlite_master WHERE type='table';"
```

---

# Testing

Run tests in watch mode:

```bash
npm test
```

Run once:

```bash
npm run test:run
```

Current test coverage includes:

* Health endpoint
* Create note
* Get all notes
* Get note by ID
* Missing note handling
* Update note
* Delete note
* KV cache MISS behavior
* KV cache HIT behavior

---

# Continuous Integration

GitHub Actions runs automatically on every push to `master`.

Pipeline steps:

1. Checkout repository
2. Install dependencies
3. Generate Cloudflare Worker types
4. Run Vitest test suite

A failed test prevents future deployment steps.

---

# Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

After deployment, the API will be available through your Cloudflare Worker URL.

---

# Tech Stack

| Technology         | Purpose              |
| ------------------ | -------------------- |
| TypeScript         | Application language |
| Cloudflare Workers | Serverless runtime   |
| Cloudflare D1      | SQLite database      |
| Workers KV         | Distributed cache    |
| Wrangler           | Cloudflare CLI       |
| Vitest             | Testing framework    |
| GitHub Actions     | CI pipeline          |

---

# Future Improvements

* Authentication and authorization
* API rate limiting
* OpenAPI documentation
* Request validation
* Pagination
* Monitoring and analytics
* Automated production deployment

