# Operations Runbook

This document acts as the source of truth for how we test, ship, and operate **signQA**.

## Testing strategy

| Layer | Tooling | Purpose |
| ----- | ------- | ------- |
| Unit | [Vitest](https://vitest.dev/) | Validates isolated utilities (e.g. the sign translation helpers). |
| Integration | Vitest + React Testing Library | Simulates a learner interacting with the UI to verify component wiring and form behaviour. |
| End-to-end | [Playwright](https://playwright.dev/) | Exercises the application through the browser exactly as a learner would, including running against a production-like preview server. |

### How to run the suites locally

```bash
# Install dependencies
npm install

# Static analysis
npm run lint
npm run typecheck

# Unit + integration tests
npm run test:unit
npm run test:integration

# Full coverage (unit + integration)
npm run test

# End-to-end tests (builds the app, then spins up the preview server)
npm run test:e2e
```

> ℹ️ Run `npx playwright install --with-deps` once on a new machine to provision the required browsers before executing the e2e suite.

Vitest runs with a JSDOM environment and automatic setup via `src/setupTests.ts`, enabling Testing Library assertions such as `toHaveTextContent`.

## Continuous integration

CI runs on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`). The pipeline performs the following sequential steps on Ubuntu runners:

1. **Install** dependencies using cached `npm` modules.
2. **Lint** the repository with ESLint (type-aware rules enabled).
3. **Type-check** using `tsc --noEmit`.
4. **Unit & integration tests** using Vitest.
5. **Build** the production bundle with Vite to ensure it compiles cleanly.
6. **Playwright** end-to-end tests against the preview server.

The workflow is intentionally serial to surface feedback quickly. All jobs upload test results and Playwright reports as workflow artefacts when running in CI.

## Deployment

signQA is optimised for deployment on [Vercel](https://vercel.com/).

- `vercel.json` configures Vercel to treat the project as a `@vercel/static-build` output, running `npm run build` and serving the generated `dist/` directory.
- Environment variables prefixed with `VITE_` are exposed to the client at build time. Provide local defaults via `.env` and production values via the Vercel dashboard.

### Deploying manually

1. Ensure `main` is green (CI must pass).
2. Tag a release (see "Release process").
3. Trigger the Vercel deployment (automatic when pushing to the production branch, or manually via the Vercel UI/CLI).
4. Validate the deployment via the attached preview URL and smoke-test the Playwright script if required: `npx playwright test --project chromium --config playwright.config.ts`.

## Release process

1. Draft release notes summarising the changes and reference tickets/PRs.
2. Bump the version in `package.json` following semantic versioning.
3. Commit with `chore(release): vX.Y.Z` and merge into `main` after CI passes.
4. Tag the release (`git tag vX.Y.Z && git push origin vX.Y.Z`).
5. Publish GitHub release with changelog and deployment link.

## Secret management

- Store sensitive values (e.g. API keys) in Vercel project settings under **Environment Variables**.
- For local development, create a `.env` file based on `.env.example` (never commit `.env`).
- Rotate secrets quarterly or whenever usage anomalies are detected.
- Restrict Vercel environment variables by environment (Development / Preview / Production) to ensure least privilege.

## Data migrations

This project currently operates on static content. If future iterations introduce persistent storage:

1. Define migrations using a schema tool (e.g. Prisma Migrate or Drizzle). Store migration files under `migrations/`.
2. Guard deployments by running `npm run migrate` (or equivalent) before `npm run build` inside the CI pipeline.
3. For emergency rollbacks, maintain backwards-compatible migrations or ship compensating migrations.

## Incident response

- Log issues using GitHub Issues with severity labels.
- For user-impacting incidents, revert the offending deploy from the Vercel dashboard and create a follow-up task for a patch release.
- Document learnings in the release notes of the corrective deployment.
