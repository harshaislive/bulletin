# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Node.js app with an Express server and a Vite-built React client.

- `server.js`: Express entry point, token/session endpoints, and SSR wiring.
- `client/components`: reusable UI pieces such as `App.jsx`, `EventLog.jsx`, and `ToolPanel.jsx`.
- `client/pages`: route-level page modules; `index.jsx` is the main screen.
- `client/assets`: static assets such as `openai-logomark.svg`.
- `client/entry-client.jsx` and `client/entry-server.jsx`: client and SSR entry files.
- `vite.config.js`, `tailwind.config.js`, `postcss.config.cjs`: frontend build and styling config.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the local dev server with `nodemon` on `http://localhost:3000`.
- `npm run start`: run the server once without file watching.
- `npm run build`: build both the client bundle and SSR server output into `dist/`.
- `npm run lint`: run ESLint with `--fix` on `.js` and `.jsx` files.

Before running locally, create `.env` from `.env.example` and set `OPENAI_API_KEY`.

## Coding Style & Naming Conventions
Use 2-space indentation, semicolons, double quotes, and trailing commas. These rules come from [`.prettierrc`](/home/harsha-mudumba/ai_projects/ai_ppt_march13/openai-realtime-console/.prettierrc). Prefer:

- `PascalCase` for React components: `SessionControls.jsx`
- `camelCase` for variables and functions
- clear, single-purpose modules in `client/components`

Keep server logic in `server.js` or extract it into small modules instead of mixing API and UI concerns.

## Testing Guidelines
There is no committed test framework or `npm test` script yet. For changes, at minimum:

- run `npm run build`
- run `npm run dev` and verify the main Realtime flow manually
- include focused tests if you introduce a test runner later

When adding tests, place them near the feature or under a top-level `tests/` directory and use names like `ComponentName.test.jsx`.

## Commit & Pull Request Guidelines
Recent commits are short and imperative, for example `update for GA` and `shave some lines`. Follow that style: brief, present-tense summaries focused on one change.

PRs should include a clear description, note any API or env changes, link the related issue if one exists, and attach screenshots or short recordings for UI updates.

## Security & Configuration Tips
Never commit `.env` or expose real API keys in logs, screenshots, or sample payloads. Keep local secrets in `.env`, and validate any new server endpoint against the existing OpenAI token/session flow.
