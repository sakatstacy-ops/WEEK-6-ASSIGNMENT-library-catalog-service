# Deployment notes

## Hosting plan

The backend is prepared for **Render** with the checked-in `render.yaml` blueprint. It starts the Express API with `npm start`, exposes `/api/health` for health checks, and runs on Render's assigned `PORT`.

Required Render environment:

| Variable | Value |
|---|---|
| `MONGODB_URI` | MongoDB Atlas replica-set connection URI; transactions require a replica set |
| `JWT_SECRET` | A unique secret of at least 32 characters; the Render blueprint generates it |
| `FRONTEND_ORIGIN` | Exact deployed frontend origin, such as `https://<site>.netlify.app` |
| `PORT` | Supplied by Render |

Never commit the real Atlas URI or JWT secret. Configure Atlas network access for the selected backend host and grant the database user only the permissions required by the application.

## Deployment status and verification

The Render service has not yet been provisioned, so a live backend URL is not available. After provisioning, verify `GET /api/health`, `GET /api/books`, and `GET /api/books/genres`; then verify that the frontend origin can make authenticated API requests. The deployment instructions and frontend build variable are in the frontend repository's `DEPLOYMENT.md`.

## Deployment issue found and fix

During deployment preparation, the existing browser app's default relative `/api` URL was identified as a cross-origin production issue: a static frontend would send that request back to its own host instead of the Render API. The frontend now requires `VITE_API_BASE_URL` in production, and the backend reads an explicit `FRONTEND_ORIGIN` allowlist for CORS. These fixes are in place, but no live hosting incident is claimed before a deployment has actually been made.
