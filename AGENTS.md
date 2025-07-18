# Repository Guidelines

This repo contains the **TSLA AI UI Agent** built with Next.js 15.1.8. All contributions should follow the release-specific design described in the appropriate PRD and release management documents.

## Current Release Focus

**🎯 Current Release: 1.1 (Stabilization)**
- **Primary Document**: [PRD-1.0.md](prd-1.0.md) - Baseline requirements
- **Task Management**: [Release-1.1.mdc](release-1.1.mdc) - Stabilization tasks and progress
- **Scope**: Cypress testing, React state fixes, code refactoring

**⛔ Do NOT work on Release 1.2+ features yet** - Focus only on completing Release 1.1.

## Project Structure

### Release Documentation Hierarchy
```
# Core Project Structure
prd.md                   # Project overview and release roadmap
prd-1.0.md              # Release 1.0 (MVP) detailed requirements
prd-backlog.md          # Future features (not scheduled)

# Release Task Management  
release-1.0.mdc         # Release 1.0 task breakdown (completed)
release-1.1.mdc         # Release 1.1 task breakdown ← CURRENT FOCUS
release-1.2.mdc         # Release 1.2 planning (session management)
release-1.3.mdc         # Release 1.3 planning (code generation)
release-backlog.mdc     # Future releases backlog
```

### Development Guidelines
**Reference Documents in Order:**
1. **[PRD-1.0.md](prd-1.0.md)** - Understand baseline requirements
2. **[Release-1.1.mdc](release-1.1.mdc)** - Find stabilization tasks and track progress
3. **[AGENTS.md](AGENTS.md)** - Follow development standards (this document)

**Task Assignment Protocol:**
- I will only assign you bite-sized tasks (e.g., 3.2.3)
- Complete only the assigned task - do NOT move to next tasks (3.2.4, 3.3.1, etc.)
- Update the appropriate .mdc file when task is completed
- Do NOT work on Release 1.2+ features until Release 1.1 is complete

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
- Keep new documentation under `docs/` and update `release-1.0.mdc` or `release-1.1.mdc` when a task is completed.
- when developing test driven development which is always needed, never use az cli commands since it doesn't work on codex, always use node and then DefaultAzureCredential, which works for everyone
- All Azure authentication and testing should use DefaultAzureCredential with Service Principal credentials (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)

## Commit Messages
- Start with the ID in the mdc if possible, if you're requested to work on let's say 3.2.4, make sure 3.2.4 is the first thing in the commit
- Start with a short one line summary (<=72 characters).
- Leave a blank line, then provide additional context with bullet points if needed.

## Pull Requests
- Start with the ID in the mdc if possible, if you're requested to work on let's say 3.2.4, make sure 3.2.4 is the first thing in the pull request
- Summarize major changes and reference the PRD or release-1.0.mdc/release-1.1.mdc document when relevant.
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
