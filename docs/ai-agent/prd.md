**Product Requirements Document (PRD)**

---

### Project Title: TSLA AI UI Agent

### Overview:

An AI-powered design-to-code agent embedded within a Next.js app, capable of generating visual UIs (graphs/tables) from Tesla sentiment and stock data via Cosmos DB. The app guides users through a multistep agent pipeline, enabling retryable design/code cycles. The project leverages MCP (Model Context Protocol), Azure Blob Storage, and Azure AI Foundry for context and persistence.

---

### Goals:

* Use AI to propose, evaluate, and implement UI features based on TSLA sentiment and stock data.
* Support a step-based AI agent with a visual trace and execution log.
* Enable feature code download and future PR automation.
* Integrate with MCP server and Azure Blob storage for state and execution data.
* Support both SSR and CSR within Next.js 15.1.8 using the App Router.

---

### Key Features:

#### Agent Pipeline:

1. **Design Concept Generation**

   * User enters a creative brief (encouraged to pre-collaborate with AI tools like ChatGPT).
   * LLM generates a clean, modifiable UI design concept (graphs + tables).

2. **Design Evaluation**

   * LLM scores and ranks multiple design concepts based on clarity, alignment with data types, and modifiability.

3. **Figma Spec Generation**

   * Multiple figma-compatible specs generated in parallel.

4. **Spec Selection**

   * LLM selects the most usable spec based on effort vs. clarity tradeoffs.

5. **Code Generation**

   * Generates a full Next.js + TypeScript feature (React components, Tailwind).
   * Self-contained feature folder with minimal routing logic.

6. **Download Artifacts**

   * Code is downloadable.
   * Execution results stored per-user in Blob Storage: `userId/executionId/`.

#### User Experience:

* Users see visual agent flow with active step indicators (e.g., blinking/highlighted).
* A collapsible timeline shows step start/end with timestamps.
* Export full execution (Figma spec + code + summary trace).
* Users can revisit past runs via execution history.

---

### Technical Design:

#### App Architecture:

* Framework: **Next.js 15.1.8** with App Router.
* Styling: **TailwindCSS** (via `npx` setup).
* Agent Flow UI: SSR for baseline, CSR for interaction/live updates.
* Data Visualization: Open (Recharts/D3/others allowed).

#### Preferred Code Structure:

```
/app                     ← App Router routing lives here
  /dashboard
    /page.tsx
  /chat
    /page.tsx
  /layout.tsx
  /globals.css

/components              ← Reusable UI elements (client/server split with 'use client')
  /ui/
  /charts/
  /chat/

/features                ← Feature-based logic (e.g., auth, ai-chat)
  /ai/
    /components/         ← Feature-specific components
    /api/
    /utils.ts
  /stocks/
    /components/
    /hooks.ts
    /api/

/hooks                   ← Global shared custom hooks

/lib                     ← Core logic like API clients, Cosmos SDK, Foundry wrapper
  cosmosClient.ts
  aiClient.ts
  graphUtils.ts

/providers               ← Context providers (e.g., theme, chat state)

/types                   ← Global TypeScript types

/utils                   ← Utility functions (formatters, date parsers)

/public                  ← Static assets (favicon, images)

/config                  ← App config: constants, env parsing, tokens
```

#### App Bootstrapping Command:

```
npx create-next-app@latest
✔ What is your project named? … shadow-pivot-ai-agentv2
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a src/ directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for next dev? … Yes
✔ Would you like to customize the import alias (@/* by default)? … No
```

#### Backend & AI:

* AI Agent: Powered via **MCP client/server** with access to Azure data.
* AI Integration: Uses **Azure AI Foundry** if available.
* Authentication:

  * **Managed Identity** on Azure server.
  * **DefaultAzureCredential** for local development:

    * Uses local `az login` identity via Azure CLI token
    * Automatically resolves to Managed Identity on Azure App Service
    * Enables unified credential usage across environments
* Storage: **Azure Blob Storage (Hot v2 tier)**

  * All executions stored under `/userId/executionId/*`
* AI Step Computation:

  * Parallel Figma generation where applicable
  * Decision steps marked with visual nodes

#### Local Development Notes:

* When running `npm run dev`, `DefaultAzureCredential` resolves to your local Azure CLI session.
* Developers should run `az login` beforehand.
* For debugging auth, use `AZURE_LOG_LEVEL=verbose npm run dev` to confirm which credential is being used.
* SDK calls must be made only within server components or API routes (never client components).

#### User Identity:

* Each user assigned a GUID ID (shown in UI)
* Local access token used for scoped blob operations

#### Storage Format:

* Design specs: JSON + PNG previews (if applicable)
* Code bundles: Zip archive
* Execution metadata: Trace log JSON + agent state JSON

---

### MVP Scope:

* ✅ Manual creative brief input
* ✅ Agent flow w/ visual indicators
* ✅ Code download (not GitHub PR)
* ✅ Full run archive export
* ✅ Execution storage in Azure Blob
* ✅ Parallel generation steps
* ✅ MCP client/server in container under shared ASP
* ✅ Azure AI Foundry integration (if possible)
* ✅ Managed Identity on Azure, DefaultAzureCredential for local
* ✅ No retries or edits for failed steps (yet)
* ✅ No Storybook/test code (yet)
* ✅ All executions and agent runs visible to all users
* ✅ Infrastructure will be documented and provisioned manually for MVP

---

### Deployment & Infrastructure Notes:

* A `Dockerfile` and `.dockerignore` will be included to support containerized builds and deployments.

* GitHub Actions will be used to automate Docker-based deployments.

* We will reuse and adapt the proven code and patterns from the following working examples:

  * GitHub Actions Workflow: [main\_shadow-pivot-nextjsv2.yml](https://github.com/jackzhaojin/shadow-pivot-nextjs/blob/main/.github/workflows/main_shadow-pivot-nextjsv2.yml)
  * Dockerfile: [Dockerfile](https://github.com/jackzhaojin/shadow-pivot-nextjs/blob/main/Dockerfile)
  * Docker Ignore File: [.dockerignore](https://github.com/jackzhaojin/shadow-pivot-nextjs/blob/main/.dockerignore)

* An `infrastructure.md` file will be included in the codebase to guide developers through setting up the necessary Azure resources:

  * Azure Storage Account
  * Azure AI Foundry
  * Managed Identities
  * User permissions and roles

* Full Infrastructure as Code (IaC) will be developed post-MVP.

---

### Future Enhancements (Post-MVP):

* Retry/modify steps and re-run
* GitHub PR integration
* Storybook/test support in generated feature
* Multi-agent collaboration
* AI metrics dashboard per execution
* Full Infrastructure as Code automation (e.g., Terraform, Bicep)

---

### Open Items:

* Which graph library will be selected (leave flexible for now)
* How to handle authentication/token rotation for blob SAS
* Cost optimization for blob cleanup policies
