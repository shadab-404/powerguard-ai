# PowerGuard AI

Local development and quick start

Prerequisites
- Node.js (>=18 recommended)
- pnpm or npm (project uses pnpm in packageManager but npm works too)

Install

```bash
npm install
# or pnpm install
```

Run (development)

This project has two dev servers: the frontend (Vite) and a backend server (tsx watch). Use the provided helper script:

```bash
npm run karao
```

What `karao` does
- Starts the Vite dev server (frontend) with --host.
- Starts the server watcher using `tsx watch server/index.ts`.

Frontend: http://localhost:5173 (Vite)
Backend: http://localhost:3000 (if configured in `server/index.ts`)

Useful scripts
- `npm run dev` — start frontend only
- `npm run dev:server` — start backend only
- `npm run build` — build frontend & bundle server
- `npm run start` — run built server (production)

If you prefer HTTPS pushes, see repository settings for configuring SSH keys and the `karao` script is a small convenience wrapper suitable for macOS / Linux shells.

---

If you'd like, I can also:
- commit the workspace file `powerguard-ai.code-workspace` into the repo, or add it to `.gitignore` (your call),
- add a CONTRIBUTING or PR template,
- wire up a simple health-check endpoint for the server,
- add a small README badge or CI config.

Tell me which of the above you'd like and I'll add them.
