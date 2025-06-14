# Repository Guidelines

This repo contains the **TSLA AI UI Agent** built with Next.js 15.1.8. All contributions should follow the high level design described in `prd.md` in root project and the task breakdown in `release-1.0.mdc` (MVP) or `release-1.1.mdc` (Post-MVP).

We're on 1.0 at the moment, do not do 1.1 yet.

Also I will only ask you take on a bite size, if you finish the 1.2.3 (example) you're on, do not move onto 1.2.4 or 1.3.1.

## Folder Structure
Use the structure outlined in the PRD when adding new code:

```
/app                      - App Router routes
/components               - Shared UI components
/features/<feature>/      - Feature folders (components, api, utils)
/hooks                    - Shared hooks
/lib                      - Core logic such as API clients
/providers                - React context providers
/types                    - Global types
/utils                    - Utility helpers
/public                   - Static assets
/config                   - Configuration
```

## Development Rules
- Use **TypeScript** and **TailwindCSS** for new code.
- Server components and API routes may call Azure SDKs. Do not call them from client components.
- Keep new documentation under `docs/` and update `release-1.0.mdc` or `release-1.1.mdc` when a task is completed.
- When developing test driven development which is always needed, never use az cli commands since it doesn't work on codex, always use node and then DefaultAzureCredential, which works for everyone
- All Azure authentication and testing should use DefaultAzureCredential with Service Principal credentials (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)

## Test Architecture

Tests are organized by purpose and dependencies in the `/tests` directory:

```
/tests
  /unit          - Pure business logic tests (no external dependencies)
  /integration   - Tests for external services (Azure, etc.)
  /api           - API route tests (requires server)
  /ui            - UI component tests (requires NextJS)
  /e2e           - End-to-end user journey tests
  /fixtures      - Shared test data and helpers
```

### Test Naming Conventions
- Unit tests: `*.unit.test.js`
- Integration tests: `*.integration.test.js`
- API tests: `*.api.test.js`
- UI tests: `*.ui.test.js`
- E2E tests: `*.e2e.test.js`

### Running Tests
- `npm run test`: Run all tests
- `npm run test:unit`: Run unit tests only
- `npm run test:integration`: Run integration tests only
- `npm run test:api`: Run API tests only
- `npm run test:ui`: Run UI tests only
- `npm run test:e2e`: Run E2E tests only

## Commit Messages
- Start with the ID in the mdc if possible, if you're requested to work on let's say 3.2.4, make sure 3.2.4 is the first thing in the commit
- Start with a short one line summary (<=72 characters).
- Leave a blank line, then provide additional context with bullet points if needed.

## Pull Requests
- Start with the ID in the mdc if possible, if you're requested to work on let's say 3.2.4, make sure 3.2.4 is the first thing in the pull request
- Summarize major changes and reference the PRD or release-1.0.mdc/release-1.1.mdc document when relevant.
- Provide the results of the programmatic checks listed below.

## Setup
Run `npm install` as soon as you open a new environment or after cloning the repository. This installs dependencies required by TypeScript builds and tests like `npm run test:ai-connection`.

After dependencies are installed, validate your environment by running the baseline authentication script:

```bash
./baseline-testing/local-node-tests/quick-auth-test.sh
```

Resolve any missing tools or login issues the script reports before continuing. Always install packages and run this baseline test before running lint, build, or other test commands. Emphasize a test-driven workflow by executing available test scripts whenever adding new code.

## Programmatic Checks
Run the following before committing:

```bash
npm run lint
npm run build
```

If a command fails due to environment limitations, mention it in the PR body.

If `npm run lint` or `npm run build` fail with "next: not found", run `npm install` to set up dependencies.

## Error logging and maintaining a dev AI log
Feel free to create inside the docs/ai-log folder, follow existing naming with yyyy-mm-dd-codex-topic

## Azure Authentication Troubleshooting
If you encounter Azure authentication issues during development or testing, run the detailed authentication test:

```bash
node baseline-testing/local-node-tests/azure-auth-test.js
```

This will help identify if the issue is with Azure credentials, network connectivity, or service configuration. Azure CLI is not supported in Codex; use Service Principal credentials with environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID).
