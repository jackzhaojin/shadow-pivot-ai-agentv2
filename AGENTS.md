# Repository Guidelines

This repo contains the **TSLA AI UI Agent** built with Next.js 15.1.8. All contributions should follow the high level design described in `docs/ai-agent/prd.md` and the task breakdown in `project-management.mdc`.

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
- Keep new documentation under `docs/` and update `project-management.mdc` when a task is completed.

## Commit Messages
- Start with a short one line summary (<=72 characters).
- Leave a blank line, then provide additional context with bullet points if needed.

## Pull Requests
- Summarize major changes and reference the PRD or project-management document when relevant.
- Provide the results of the programmatic checks listed below.

## Programmatic Checks
Run the following before committing:

```bash
npm run lint
npm run build
```

If a command fails due to environment limitations, mention it in the PR body.

If `npm run lint` or `npm run build` fail with "next: not found", run `npm install` to set up dependencies.

## Azure Authentication Troubleshooting
If you encounter Azure authentication issues during development or testing:

```bash
# Run baseline Azure authentication test for triaging
./baseline-testing/quick-auth-test.sh
```

Or run the authentication test directly:

```bash
node baseline-testing/azure-auth-test.js
```

This will help identify if the issue is with Azure credentials, network connectivity, or service configuration. Make sure you're logged in with `az login` before running these tests.
