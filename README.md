# Labspot frontend

React + JavaScript + Vite. Deploy target: GitHub Pages repository `VitaliyArmss/labspot-frontend`.

Public site: `https://vitaliyarmss.github.io/labspot-frontend/`  
Production API: `https://api.vitaliy-armss.ru/labspot/api`

## GitHub Pages deploy

1. Create the `labspot-frontend` repository under `VitaliyArmss`.
2. Push the **contents of this directory** to the repository root, on branch `main`.
3. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
4. Push a commit or manually run the `Deploy React app to GitHub Pages` workflow from **Actions**.
5. When the workflow succeeds, open `https://vitaliyarmss.github.io/labspot-frontend/`.

The workflow installs dependencies, builds with `VITE_API_URL=https://api.vitaliy-armss.ru/labspot/api`, and publishes `dist/`. `vite.config.js` uses `/labspot-frontend/` only in GitHub Actions, so the development server still serves from `/`.

## Local development

Requires Node.js 22.12+.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

By default the local frontend calls `http://localhost:5003/api`; change `.env.local` if your local API uses another port. Start the backend and import the SQL dump before testing sign-in and checkout.

## Test logins

- `demo` / `demo123`
- `manager` / `manager123`

There is no registration or real payment processing. Do not store backend secrets in this repository; only the public API URL is embedded in the frontend build.
