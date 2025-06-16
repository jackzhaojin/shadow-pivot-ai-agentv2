# AI UI Agent Core Capabilities Blueprint

**Last Updated:** June 16, 2025

This blueprint summarizes the key technical decisions and patterns implemented in the TSLA AI UI Agent project. It serves as a high-level reference for new contributors and a record of why certain approaches were chosen.

## 1. Next.js 15 App Router Architecture

- **Server Components** handle data fetching, Azure SDK calls, and heavy logic.
- **Client Components** manage interactive UI pieces and state-driven flows.
- **Hybrid Rendering** mixes SSR for first‑load performance with CSR for dynamic user interactions.
- **Feature Folders** under `features/` keep related UI, API routes and helpers together.

The entry points under `app/` expose pages for the agent (`/agent`), a basic
dashboard (`/dashboard`) and simple testing routes. API endpoints live under
`app/api/agent/*` and call service functions from the `lib` folder. This keeps
server logic inside the App Router where it is executed on the server.

## 2. Step‑Based Agent Workflow

- The agent progresses through defined steps (design concept, evaluation, code generation, etc.).
- Context providers (`AgentFlowProvider`) manage global state and expose helper actions.
- A direct API triggering pattern ensures sequential calls fire reliably without waiting for React state batching.
- Step execution is orchestrated in `StepExecutor.tsx`. It calls the API routes
  in order and updates the provider state when each request succeeds.
- `AgentFlowTimeline.tsx` renders progress indicators and allows step detail
  toggling via utilities from `lib/utils/stepResults.ts`.

## 3. Azure Integration via DefaultAzureCredential

- All Azure services (Blob Storage, AI Foundry) authenticate using `DefaultAzureCredential`.
- Credentials are supplied through environment variables or Managed Identity in production.
- Service clients are encapsulated in `lib/daos/` for reuse across the app.
- `storageClient.ts` manages the executions container and blob uploads.
- `aiClient.ts` wraps the Azure OpenAI SDK with helper functions such as
  `generateChatCompletion`.

## 4. Service and DAO Layering

- **DAO Layer**: Wraps direct service calls (e.g., `aiClient.ts`, `storageClient.ts`).
- **Service Layer**: Contains business logic like design evaluation, scoring, and execution tracing.
- This separation keeps components thin and simplifies unit testing.
- `designConcept.ts` and `designEvaluation.ts` implement the core agent logic of
  generating multiple concepts and ranking them.
- `specSelection.ts` provides simple helpers for picking the best option.

## 5. Testing & Troubleshooting

- Baseline authentication tests verify Azure connectivity in all environments.
- Linting (`npm run lint`) and build checks (`npm run build`) are required before commits.
- Key issues and resolutions are documented in [Key Issue Resolution](../key-issue-resolution/).
- A test suite under `tests/` exercises the DAO layer and baseline Azure
  connectivity (`tests/dao/ai-connection.test.js`). Run all tests with
  `npm run test:all`.

## 6. Prompt Template System

- Prompt templates stored in `prompts/` are loaded via
  `lib/utils/promptUtils.ts`.
- Templates define a system prompt, a user prompt template and expected response
  shape which is validated after calling the LLM.
- This ensures repeatable AI requests and easier debugging of parsing failures.

---

For detailed implementation examples, see the individual documents in this `blueprint` directory and the PRD for feature specifications.
