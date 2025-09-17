# Repository Guidelines

## Project Structure
- `src/`: PHP application code (namespace `GeeknDragon\` via PSR‑4).
- `public/`: Web root and front controller (`index.php`, `.htaccess`).
- Top-level PHP endpoints: `index.php`, `contact.php`, `product*.php`, etc.
- Frontend sources: `core/`, `js/`, `css/`; shared assets in `images/`, `templates/`, `views/`, `partials/`, `translations/`, `data/`.
- `tests/`: Mixed PHP (`*Test.php`), JS unit (`*.test.js`), and Playwright e2e (`e2e/*.spec.js`).
- `tools/`: Utility scripts (e.g., `tools/linkcheck.php`, reports); `vendor/`: Composer deps (do not edit).

## Build, Test, and Dev
- `npm run dev`: Start Vite dev server.
- `npm run build`: Build frontend assets (Tailwind, Vite).
- `npm test`: Run JS unit tests (Jest).
- `npm run test:e2e`: Run Playwright tests (first time: `npx playwright install`).
- `composer test`: Run PHPUnit over `tests/`.
- `composer build` (or `composer run-script build`): Run `npm run build` then `composer dump-autoload`.
- Helpful: `composer linkcheck`, `composer report`, `composer sync-products`.

## Coding Style & Naming
- PHP: PSR‑12, 4‑space indent, classes StudlyCaps, methods camelCase. Namespace under `GeeknDragon\\` and keep files in `src/` matching class names.
- JS/TS: ESLint + Prettier. Use `npm run lint` and `npm run format`. Prefer camelCase for vars/functions, kebab-case for filenames (e.g., `base-widget.js`).

## Testing Guidelines
- PHP: Place tests as `tests/*Test.php`. Run `composer test`.
- JS: Place unit tests as `tests/*.test.js`. Run `npm test`.
- e2e: `tests/e2e/*.spec.js` with Playwright. Run `npm run test:e2e`.
- Aim for meaningful coverage on new/changed code; keep tests fast and isolated.

## Commit & PR Guidelines
- Commits: Use imperative, concise messages. Prefer Conventional Commits (e.g., `feat:`, `fix:`) observed in history; avoid vague `mise a jour`.
- PRs: Include summary, linked issues, repro/validation steps, and screenshots for UI changes. Ensure `composer test` and `npm test` pass; include any migration/config notes.

## Security & Config
- Copy `.env.example` to `.env` for local development. Never commit secrets; prefer environment variables over files under `tokens/`.
- Keep `public/` as the only web-exposed directory.
