# Repository Guidelines

This repo contains the **TSLA AI UI Agent** built with Next.js 15.1.8. All contributions should follow the release PRDs (`prd-1.0.md`, `prd-1.1.md`, etc.) and the matching `release-*.mdc` task plans.

We're focusing on release 1.0 tasks unless the plan specifies a later version.

Also I will only ask you take on a bite size, if you finish the 1.2.3 (example) you're on, do not move onto 1.2.4 or 1.3.1.

## Folder Structure
Use the structure outlined in the PRD when adding new code:

```
/app                      - App Router routes
/components               - Shared UI components
/features/<feature>/      - Feature folders (components, api, utils)
/hooks                    - Shared hooks
/lib                      - Core logic such as API clients
/lib/dao                  - Data access objects and persistence logic
/lib/services             - Business logic and service layer
/lib/utils                - Utility helpers and shared functions
/providers                - React context providers
/types                    - Global types
/utils                    - Utility helpers
/public                   - Static assets
/config                   - Configuration
```

## Development Rules
- Use **TypeScript** and **TailwindCSS** for new code.
- Server components and API routes may call Azure SDKs. Do not call them from client components.
- Keep new documentation under `docs/` and update the relevant `release-*.mdc` file when a task is completed.
- when developing test driven development which is always needed, never use az cli commands since it doesn't work on codex, always use node and then DefaultAzureCredential, which works for everyone
- All Azure authentication and testing should use DefaultAzureCredential with Service Principal credentials (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)

## Commit Messages
- Start with the ID in the mdc if possible, if you're requested to work on let's say 3.2.4, make sure 3.2.4 is the first thing in the commit
- Start with a short one line summary (<=72 characters).
- Leave a blank line, then provide additional context with bullet points if needed.

## Pull Requests
- Start with the ID in the mdc if possible, if you're requested to work on let's say 3.2.4, make sure 3.2.4 is the first thing in the pull request
- Summarize major changes and reference the appropriate PRD or release plan when relevant.
- Provide the results of the programmatic checks listed below.

## Setup
Run `npm install` as soon as you open a new environment or after cloning the repository. This installs dependencies required by TypeScript builds and tests like `npm run test:all`.

After dependencies are installed, validate your environment by running the baseline authentication script:

```bash
node tests/baseline/azure-auth-test.js
```

Resolve any missing tools or login issues the script reports before continuing. Always install packages and run this baseline test before running lint, build, or other test commands. Emphasize a test-driven workflow by executing available test scripts whenever adding new code.

## Programmatic Checks
Run the following before committing:

```bash
npm run lint
npm run build
```

### Test Commands

Run `npm run test:all` to execute the full test suite. Individual groups can be run with:

```bash
npm run test:dao      # DAO layer tests (AI client, Azure connections)
npm run test:services # Service logic tests (user GUID, spec selection, execution)
npm run test:endpoints # External API/endpoint tests (design concept, evaluation)
npm run test:ui       # UI component tests (agent flow, spec selection UI)
npm run test:e2e      # End-to-end tests (spec selection, integration workflows)
```

If a command fails due to environment limitations, mention it in the PR body.

If `npm run lint` or `npm run build` fail with "next: not found", run `npm install` to set up dependencies.

## Error logging and maintaining a dev AI log
Feel free to create inside the docs/ai-log folder, follow existing naming with yyyy-mm-dd-codex-topic

## Technical Documentation
For detailed technical implementation guides, debugging resources, and architectural decisions, see the **[Technical Documentation Index](docs/technical/README.md)**. For a summary of core architecture patterns, see the **[Technical Blueprint](docs/technical/blueprint/README.md)** and its **[Core Capabilities](docs/technical/blueprint/core-capabilities.md)** document. This documentation includes:

- **Implementation Patterns**: React state management, API integration patterns, error handling strategies
- **Debugging Guides**: Common issues, troubleshooting steps, and resolution examples
- **Architectural Decisions**: Design choices, trade-offs, and technical rationale
- **Performance & Optimization**: Best practices and monitoring approaches

When encountering complex technical issues or implementing significant features, document the solution in `docs/technical/` following the established patterns.

## Azure Authentication Troubleshooting
If you encounter Azure authentication issues during development or testing, run the detailed authentication test:

```bash
node tests/baseline/azure-auth-test.js
```

This will help identify if the issue is with Azure credentials, network connectivity, or service configuration. Azure CLI is not supported in Codex; use Service Principal credentials with environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID).
