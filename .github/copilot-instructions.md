Copilot instructions — PachaMama-Project

1) Build, test, and lint commands

- Development server: pnpm run dev  # Vite dev (HMR). Use a different port: pnpm run dev -- --port 3000
- Build production: pnpm run build
- Preview production build: pnpm run preview
- Lint: pnpm run lint  (runs: eslint .)
- Type-check: pnpm run type-check  (runs: tsc --noEmit)
- Deploy (GitHub Pages): pnpm run deploy (build + gh-pages)

Notes for single-file workflows:
- Lint a single file: pnpm exec eslint src/path/to/file.tsx --fix
- Type-check a single file (quick check): pnpm exec tsc --noEmit src/path/to/file.tsx
- There are no automated unit tests configured in the repository (no tests/ or test script). If tests are added later, follow the repo's scripts.

CI/automation
- The repo uses a GitHub Actions workflow: .github/workflows/deploy.yml — it runs pnpm install --frozen-lockfile, pnpm run build and publishes ./dist to GitHub Pages.

2) High-level architecture (big picture)

- Stack: React + TypeScript + Vite (SWC) + Tailwind CSS v4. UI libs: Radix UI, Lucide React, Sonner. Charts: Recharts. DB/backend: Supabase (supabase-js used in src/services).
- Entry: src/main.jsx -> mounts App (src/app/App.tsx).
- App structure (important folders):
  - src/app/components/screens/  -> top-level screens (Dashboard, Pedidos, Clientes, Productos, Finanzas, Configuracion)
  - src/app/components/ui/       -> shared UI primitives (button, input, badge, card, sonner, etc.)
  - src/app/components/modals/   -> modal dialogs (NuevoPedidoModal, GestorStockModal, GestorOfertasModal, ListaWhatsappModal)
  - src/hooks/                   -> custom hooks (useDashboard, useSupabaseData, useListaWhatsapp)
  - src/services/                -> external services (supabase client config)
  - src/assets/private/          -> project-specific docs (installation, integration guides) — sensitive/private docs live here
- Build config: vite.config.js sets base: /PachaMama-Project/ and an alias "@" -> ./src. tsconfig.json also maps "@/*" to src/* — use this alias when editing or searching imports.

3) Key conventions and repo-specific rules

- Path alias: Use imports with @/ (e.g. import X from '@/app/components/ui/button') — both Vite and tsconfig rely on it.
- Strict TypeScript: tsconfig.json enables strict mode and many safety checks; prefer adding types over disabling rules.
- ESLint: repo enforces ESLint (see eslint.config.js). Use npm run lint and prefer npx eslint <file> for targeted fixes.
- Never overwrite core features (AI safety rule): .clinerules contains the project directive to preserve existing functionality. When changing modals or order flow, inspect the entire file (and related hooks/services) before editing. Prefer diffs/patches and modular additions over full-file replacements.
- Business-critical flows to preserve:
  - Offers and stock management: calculations and stock adjustments are tied to Supabase tables (Producto, StockMovimiento, Oferta). Do not remove these flows; extend them carefully.
  - WhatsApp message generation & memory: the app includes a feature to format messages for WhatsApp and persist a "memory" record in Supabase. Keep that behavior when refactoring.
- Local kiosk/fast UX: many screens are optimized for quick keyboard/mouse interactions; avoid heavy DOM rework that would hurt responsiveness.
- Vite base path: vite.config.js sets base to /PachaMama-Project/ — adjust when serving from a different base.

4) Other assistant/AI rules and files to consult

- .clinerules (project AI rules): contains the "CORE DIRECTIVE"—never overwrite existing functionality; follow the mandatory analysis-before-change steps.
- .cursorrules: included; review if using Cursor-style assistants.
- LEER_PRIMERO.TXT and src/assets/private/*: contain installation notes and Spanish-language guides. Read before modifying installation scripts or platform-specific helpers.

5) Quick checklist for Copilot sessions

- Read .clinerules before making changes that touch orders, offers, stock, or WhatsApp modules.
- Open the modal/component file and any hooks/services it calls before editing (e.g., NuevoPedidoModal.jsx, useListaWhatsapp.ts, useSupabaseData.ts).
- Use @ import alias when searching or editing.
- Run lint and type-check locally after edits: npm run lint && npm run type-check
- If adding tests, add a test script and document how to run an individual test in this file.

References
- README.md (project overview & commands)
- package.json (npm scripts and dependencies)
- vite.config.js and tsconfig.json (alias/base configuration)
- .clinerules and .cursorrules (AI/assistant rules)

---

If you want, Copilot sessions can be preconfigured to run the dev server or the lint/type-check steps automatically when starting. Ask if you want an MCP server configured (Playwright/Chromium for E2E, or other collectors) and which flows (deploy, test, preview) to wire up.
