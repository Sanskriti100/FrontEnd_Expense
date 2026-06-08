# Expense Tracker Frontend

Built with React + Vite.

## Local Development

1. Install dependencies: `npm ci`
2. Start dev server: `npm run dev`

## Deployment (GitHub Pages)

This app must be deployed from the Vite build output (`dist`), not directly from source files.

1. Push code to GitHub.
2. In repository settings, open **Pages**.
3. Set **Source** to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy-pages.yml` will build and deploy on push to `main`.

## Production API URL

The frontend uses `VITE_API_URL`.

- `.env.production` is configured as:
  - `https://expenses-manager-api-ns5h.onrender.com/api/expenses`

If backend URL changes, update `.env.production` and redeploy.

## White Screen Root Cause

When GitHub Pages serves source `index.html`, the browser tries to load `/src/main.jsx` (development entry) and fails in production. Deploying `dist` fixes this.
