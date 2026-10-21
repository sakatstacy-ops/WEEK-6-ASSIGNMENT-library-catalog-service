# Week 6 Library Catalog Service

Borrow tracking, shared-space booking, and librarian administration for the library catalog. This repository contains the Express/Mongoose API; the separate React/Vite application lives in [library-catalog-frontend](https://github.com/sakatstacy-ops/WEEK-5-ASSIGNMENT-library-catalog-frontend).

## Features

- Patron registration and login with signed bearer tokens.
- Public book catalog; librarians can add, edit, and delete books through the Book CRUD API.
- Signed-in patrons can maintain a reading list and submit borrow requests only for saved titles.
- Borrow requests decrement available inventory on the server; requests fail if the book has no available copies.
- Librarians alone can update request status. The server sets the return timestamp and computes any fine.
- Patrons can reserve an active library space. The server rejects time overlaps for the same space and date.
- Librarians can view all borrow requests, current server-calculated fines, and all space bookings.

## Project layout

```text
models/
  Book.js
  Genre.js
  BorrowRequest.js
  Booking.js
  Space.js
  User.js
routes/
  auth.js
  books.js
  borrowRequests.js
  bookings.js
  readingList.js
  spaces.js
middleware/auth.js
utils/
  http.js
  libraryRules.js
server.js
seed.js
__tests__/
  auth.test.js
  bookings.test.js
  fine.test.js
```

## Setup and run

Requirements: Node.js 20 or newer, npm, and a MongoDB Atlas URI configured as a replica set (Atlas clusters support the transactions used for inventory consistency).

1. Clone the repository and install dependencies:

   ```powershell
   git clone https://github.com/sakatstacy-ops/WEEK-6-ASSIGNMENT-library-catalog-service.git
   cd WEEK-6-ASSIGNMENT-library-catalog-service
   npm install
   ```

2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to a dedicated assignment database and replace `JWT_SECRET` with a private random string of at least 32 characters. Never commit `.env` or a real database credential.

3. Seed the sample genres, books, and one booking space:

   ```powershell
   npm run seed
   ```

   **Warning:** seeding deletes and recreates the `books` and `genres` collections in the configured database. Use a development database, not a database containing data you need to keep. The sample space `Reading Room A` is inserted if it does not already exist.

4. Start the API:

   ```powershell
   npm run dev
   ```

   The API runs on <http://localhost:4000>. Start the frontend separately by following its README.

5. Create a patron account using the frontend or `POST /api/auth/register`. Public registration always creates a patron; it never accepts a role from the request. To make a demo librarian, use a trusted MongoDB admin shell:

   ```javascript
   db.users.updateOne(
     { username: "your-librarian-username" },
     { $set: { role: "librarian" } }
   )
   ```

   Sign out and back in after promotion. The API enforces the librarian role independently of the frontend.

## API

All protected requests use `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a patron account |
| `POST` | `/api/auth/login` | Public | Sign in |
| `GET` | `/api/auth/me` | Signed in | Read the current account |
| `GET` | `/api/books` | Public | List books |
| `GET` | `/api/books/genres` | Public | List genres for catalog editing |
| `POST` | `/api/books` | Librarian | Create a book |
| `PATCH` | `/api/books/:id` | Librarian | Edit a book |
| `DELETE` | `/api/books/:id` | Librarian | Delete a book without outstanding loans |
| `GET` | `/api/reading-list` | Signed in | List the current patron's saved books |
| `POST` / `DELETE` | `/api/reading-list/:bookId` | Signed in | Save/remove a book |
| `GET` | `/api/borrow-requests` | Signed in | List own requests; librarians see all |
| `POST` | `/api/borrow-requests` | Signed in | Request a saved book with `{ "bookId": "..." }` |
| `PATCH` | `/api/borrow-requests/:id` | Librarian | Update `{ "status": "approved" }` (or another valid status) |
| `GET` | `/api/spaces` | Public | List active booking spaces |
| `POST` | `/api/bookings` | Signed in | Create a booking |
| `GET` | `/api/bookings` | Librarian | List all bookings |

Unauthorized requests receive `401 Unauthorized`; authenticated non-librarians receive `403 Forbidden` on librarian-only operations.

## Fine calculation

A new borrow request is due 14 days after its request timestamp. When a librarian changes its status to `returned`, the server stamps `returnedAt` and computes the fine itself; a client-submitted `fine` is ignored. The rule is **$0.25 per started 24-hour period after `dueAt`**, rounded up to the next whole overdue day. Returning on or before the due date costs $0.00; one minute late costs $0.25; 24 hours and one minute late costs $0.50. Inventory restoration and status/fine updates are in the same database transaction.

The accepted statuses are `pending`, `approved`, `returned`, and `late`. Status changes are restricted to librarians by API middleware, not merely hidden in the UI.

## Booking overlap check

The booking request includes a `space` id, `date` (`YYYY-MM-DD`), `startTime`, and `endTime` (`HH:mm`, 24-hour time). The server validates these values and checks stored bookings for the same `{space, date}`. It reports a conflict if both conditions are true:

```text
existing.startTime < requested.endTime
AND
existing.endTime > requested.startTime
```

This detects partial as well as full overlaps. For instance, an existing 10:00–11:00 booking conflicts with a new 10:30–11:30 request. Adjacent bookings such as 10:00–11:00 and 11:00–12:00 are allowed. A conflict responds with `409 Conflict`; the check takes place in the API, not only in the browser.

## Admin pages

After signing in as a librarian, use the navigation links:

- `/admin/books` — create, edit, and delete books via the API.
- `/admin/borrow-requests` — view requests, change status, and see due/return dates and fines.
- `/admin/bookings` — view all space reservations.

The patron can use `/reading-list` to save a catalog title and submit a borrow request and `/bookings/new` to request a space.

## Test and build

```powershell
npm test
```

The Jest suite covers authentication/RBAC responses, conflicting bookings, and calculated fine amounts. The Render blueprint is in `render.yaml`; configure `MONGODB_URI` and the exact deployed frontend origin before using the public service.

## Suggested submission recording

1. Sign in as a patron, save a book, and submit a borrow request.
2. Sign in as a librarian and open **Borrow requests**.
3. For a clear late-return demonstration, move that request's `dueAt` to the past in a trusted MongoDB admin shell. Change its status to `returned`; show the fine displayed in the table.
4. Sign in as a patron and create a space booking, for example 10:00–11:00.
5. Attempt a partially overlapping booking for the same space and date, for example 10:30–11:30. Show the server's conflict message.

The recording is a separate deliverable; capture the running app and include the video/link with the assignment submission.
