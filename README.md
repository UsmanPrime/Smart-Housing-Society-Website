# NEXTGEN Residency - Frontend Template (Vite + React + Tailwind)

This is a starter frontend template for the NEXTGEN Residency landing page.
It uses Vite + React + Tailwind CSS.

## How to run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the dev server:
   ```
   npm run dev
   ```

3. Open http://localhost:5173

## Notes

- Images are placed in `src/assets/`. Replace them with your final images as needed.
- This template is multi-page capable with React Router; additional pages are included as placeholders.
 
### Contact form backend (optional)

- Backend lives in `server/` (Express + Nodemailer). See `server/README.md`.
- In development, calls to `/api/*` are proxied to `http://localhost:5000` (see `vite.config.js`).
- You can optionally configure `VITE_API_BASE_URL` in a `.env` at the project root; otherwise the app will call `/api/...` on the same origin.

Security tip: never commit secrets. Use `server/.env` locally (see `server/.env.example`).
