# signQA

A searchable sign language knowledge base that surfaces practice tips, teaching ideas, and community Q&A with autosuggest and highlighted matches. The project ships with a full testing strategy (unit, integration, and end-to-end coverage), automated CI checks, and deployment configuration for Vercel.

## Tech stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) for the UI and build tooling
- [TypeScript](https://www.typescriptlang.org/) for static types
- [Vitest](https://vitest.dev/) + Testing Library for unit & integration tests
- [Playwright](https://playwright.dev/) for browser-based end-to-end journeys
- [ESLint](https://eslint.org/) with type-aware rules for static analysis

## Getting started

```bash
# Install dependencies
npm install

# Start the development server (http://localhost:5173)
npm run dev

# Type checking and linting
npm run typecheck
npm run lint
```


## Testing

| Command | Description |
| ------- | ----------- |
| `npm run test:unit` | Validates the search index scoring, highlighting, and suggestion helpers. |
| `npm run test:integration` | Uses React Testing Library to verify UI flows end-to-end within the DOM. |
| `npm run test:e2e` | Builds the app and runs Playwright against the preview server. |
| `npm run test` | Executes the entire Vitest suite (unit + integration) with coverage. |
| `npm run verify` | Runs linting, type-checking, unit/integration tests, and Playwright e2e tests. |

Vitest is preconfigured to generate coverage reports in `coverage/` using V8 instrumentation. Install Playwright browsers once per machine with `npx playwright install --with-deps` before running `npm run test:e2e`.

## Continuous integration

GitHub Actions (see `.github/workflows/ci.yml`) enforce the same `npm run verify` pipeline on every push and pull request:

1. Install dependencies with caching.
2. Lint and type-check the codebase.
3. Run unit/integration tests.
4. Build the production bundle.
5. Execute Playwright e2e tests against `vite preview`.

## Deployment

The repository includes `vercel.json`, enabling zero-config deployment to Vercel using the **Static Build** preset. Deployments run `npm run build` and serve the generated `dist/` directory.

### Manual deployment steps

1. Ensure CI is green on the commit you intend to deploy.
2. Push to the production branch (or trigger a deploy via the Vercel dashboard/CLI).
3. Confirm the deployment via the preview URL and optional Playwright smoke tests.
4. Promote the deployment to production from the Vercel dashboard if you are using preview branches.

## Release and operations

Operational guidance—including release management, secret handling, and migration strategy—is captured in [`docs/operations.md`](docs/operations.md).

## Project structure

```
├── public/                 # Static assets served verbatim
├── src/
│   ├── App.tsx             # Root application component
│   ├── data/               # Domain data and defaults
│   ├── lib/                # Pure utility modules
│   ├── __tests__/          # Unit and integration tests (Vitest)
│   └── setupTests.ts       # Testing library configuration
├── e2e/                    # Playwright end-to-end tests
├── docs/                   # Operational documentation
└── .github/workflows/      # CI definitions
```

Feel free to extend the knowledge base entries, refine the relevance model, or augment the autosuggest experience as product features evolve.
