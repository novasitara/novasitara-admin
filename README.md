# Nova Sitara — Admin Panel

Vite + React admin for the Nova Sitara website. It talks to the NestJS API in `../novasitara-api`.
Setup, deployment and backup instructions are in `novasitara-api/README.md`.

```bash
npm install
npm run dev   # http://localhost:5174, proxies /api and /uploads to the API on port 3000
```

Admins sign in with an account created by `npm run create-admin` in the API folder.
