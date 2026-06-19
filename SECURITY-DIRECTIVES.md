# Security Directives for PachaMama-Project

## Shift Left Security Policy
- Use `pnpm` as the preferred package manager in WSL Ubuntu to reduce supply chain risk.
- Maintain `pnpm-lock.yaml` as the authoritative dependency lockfile.
- Avoid using `package-lock.json` for future installs in this repository; prefer `pnpm install --frozen-lockfile`.
- Audit dependencies early and often with `pnpm audit`.
- Track package versions and avoid installing vulnerable versions of core packages such as React, Vite, Tailwind, and ESLint.

## Repository Security Rules
- All commits must run `pnpm audit --audit-level=moderate` before being accepted.
- Continuous integration must use `pnpm install --frozen-lockfile`.
- If a package version is found to be vulnerable, update the package to a secure version and regenerate `pnpm-lock.yaml`.
- Use `pnpm outdated` periodically to check for packages that need updates.

## Recommended Commands
```bash
pnpm install --frozen-lockfile
pnpm audit
pnpm audit --audit-level=moderate
pnpm outdated
pnpm run lint
pnpm run type-check
```
