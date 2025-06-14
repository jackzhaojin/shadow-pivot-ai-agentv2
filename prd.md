**Product Requirements Document (PRD)**

---

### Project Title: AI UI Agent with Visual Execution

### Overview:

An AI-powered design-to-code agent embedded within a Next.js app, capable of generating visual UIs (graphs/tables) for web apps. The app guides users through a multistep agent pipeline with visual execution tracking, enabling retryable design/code cycles. Integrates with Azure Blob Storage and Azure AI Foundry for context and persistence.

---

### Goals:

* Use AI to propose, evaluate, and implement UI features with visual execution tracking.
* Support a step-based AI agent with a visual trace and execution log.
* Enable Figma spec download and feature code download.
* Support both SSR and CSR within Next.js 15.1.8 using the App Router.

---

### Key Features:

#### Agent Pipeline:

1. **Design Concept Generation**

   * User enters a creative brief (encouraged to pre-collaborate with AI tools like ChatGPT).
   * LLM generates multiple clean, modifiable UI design concepts (graphs + tables).
   * **Critical requirement**: Must generate 3-5 distinct design concepts to enable meaningful evaluation in step 2.

2. **Design Evaluation**

   * LLM scores and ranks multiple design concepts based on clarity, alignment with data types, and modifiability.
   * **Dependencies**: Requires multiple concepts from step 1 to perform meaningful evaluation and ranking.

3. **Parallel Figma Spec Generation**

   * **3 Figma specs generated in parallel** - displayed in 3 concurrent processing boxes.
   * Agent tests and validates each Figma spec for usability and design quality.
   * Real-time visual feedback shows progress for each parallel generation.

4. **Spec Selection**

   * LLM selects the most usable spec based on effort vs. clarity tradeoffs.

5. **Parallel Code Generation**

   * **3 code implementations generated in parallel** - displayed in 3 concurrent processing boxes.
   * Generates full Next.js + TypeScript features (React components, Tailwind).
   * Agent tests each generated code implementation for functionality and quality.
   * Self-contained feature folders with minimal routing logic.

6. **Code Selection & Testing**

   * Agent evaluates and selects the best code implementation from the 3 generated options.
   * **Automated testing criteria**: Code quality, functionality, accessibility compliance, and component structure.
   * **Aggregate scoring system**: Combines multiple evaluation metrics for optimal selection.

7. **Download Artifacts**

   * **ZIP archive download**: Complete package containing selected Figma specs and code.
   * **Full execution trace**: Detailed log of all agent decisions and evaluations.
   * **Future enhancement**: Individual file preview capabilities (post-MVP).
   * Execution results stored per-user in Blob Storage: `userId/executionId/`.

#### User Experience:

* **Agent Input & Flow Control:**
  * Users can always enter a creative brief to start a new AI agent flow
  * Users can abort the entire agent flow at any time with a prominent abort button
  * **No manual step advancement**: Agent automatically progresses through all steps without user intervention
  * Users can start multiple flows sequentially (previous flow data remains accessible)

* **Visual Flow Indicators:**
  * Users see visual agent flow with active step indicators (e.g., blinking/highlighted)
  * A collapsible timeline shows step start/end with timestamps
  * **Progress states**: Waiting (gray) → Processing (blue/animated) → Completed (green) → Error (red)
  * Real-time progress updates show what the AI is currently doing

* **Step Results Review:**
  * **Interactive step inspection**: Users can click on any completed step to view detailed input/output
  * Step results display without disrupting the automated flow progression
  * Each step shows: input parameters, processing details, AI reasoning, and generated outputs
  * Results remain accessible throughout the entire session

* **Error Handling & Feedback:**
  * **Error visualization**: Failed steps appear with red indicators and error messaging
  * Error details displayed below the main flow timeline in a dedicated error section
  * Clear error descriptions with actionable guidance for users
  * Flow stops on errors but allows users to review previous successful steps

* **Parallel Processing Display:**
  * **3 boxes showing concurrent Figma spec generation** with real-time progress indicators
  * **3 boxes showing concurrent code generation** with real-time progress indicators
  * Each parallel process shows individual status and completion indicators

* **Execution Management:**
  * Export full execution (Figma spec + code + summary trace)
  * Users can revisit past runs via execution history
  * **Download capability**: ZIP archive with complete artifacts and execution trace

#### Agent Testing & Evaluation Criteria:

**Figma Spec Testing:**
* Design clarity and visual hierarchy
* Component structure and reusability
* Alignment with modern UI/UX principles
* Technical feasibility for code generation

**Code Implementation Testing:**
* **Functionality**: Components render correctly and handle interactions
* **Code Quality**: Clean, maintainable TypeScript/React code
* **Accessibility**: WCAG compliance and semantic HTML
* **Performance**: Optimized rendering and bundle size
* **Structure**: Proper component organization and routing integration

**Aggregate Scoring System:**
* Weighted evaluation combining all testing criteria
* Automatic selection of highest-scoring implementation
* Detailed scoring breakdown available in execution trace

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
```markdown
/lib                     ← Core logic and business layers

  /daos                  ← Data Access Objects for external services (Azure, Foundry, Storage)
    - Example: `aiClient.ts` wraps Azure AI Foundry LLM calls and prompt orchestration.
    - Example: `azureClient.ts` sets up Azure SDK clients using DefaultAzureCredential.
    - Example: `storageClient.ts` handles Blob Storage upload/download with user-scoped paths.
    - Example: `cosmosClient.ts` (future) manages Cosmos DB user/session metadata.

  /services              ← Business logic and agent workflow orchestration
    - Example: `designConcept.ts` generates multiple UI design concepts from a creative brief.
    - Example: `designEvaluation.ts` scores and ranks design concepts for clarity and modifiability.
    - Example: `figmaSpec.ts` runs parallel Figma spec generation and validates usability.
    - Example: `specSelection.ts` selects the optimal Figma spec based on agent evaluation.
    - Example: `codeGeneration.ts` generates and tests multiple code implementations in parallel.
    - Example: `codeSelection.ts` evaluates, scores, and selects the best code implementation.
    - Example: `executionTrace.ts` aggregates logs, scoring, and trace data for export.

  /utils                 ← Shared utilities and helpers
    - Example: `graphUtils.ts` provides chart/graph data shaping and library adapters.
    - Example: `promptUtils.ts` manages AI prompt templates and formatting.
    - Example: `scoringUtils.ts` implements aggregate scoring and metric weighting.
    - Example: `fileUtils.ts` handles ZIP packaging, file formatting, and download helpers.
```

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

* AI Integration: Uses **Azure AI Foundry** if available.
* Authentication:

  * **Managed Identity** on Azure server.
  * **DefaultAzureCredential** for local development:

    * If you are Codex: Uses Service Principal credentials (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
    * If you are local user or github co pilot: Uses az login
    * Automatically resolves to Managed Identity on Azure App Service
    * Enables unified credential usage across environments
* Storage: **Azure Blob Storage (Hot v2 tier)**

  * All executions stored under `/userId/executionId/*`
* AI Step Computation:

  * Parallel Figma generation where applicable
  * Decision steps marked with visual nodes

#### Local Development Notes:

* When running `npm run dev`, `DefaultAzureCredential` resolves to your Service Principal credentials.
* Developers should set environment variables: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID.
* For debugging auth, use `AZURE_LOG_LEVEL=verbose npm run dev` to confirm which credential is being used.
* SDK calls must be made only within server components or API routes (never client components).
* When developing with test driven development, always use Node.js and DefaultAzureCredential instead of az CLI commands, since they work reliably across all environments

#### User Identity:

* Each user assigned a GUID ID (shown in UI)
* Local access token used for scoped blob operations

#### Storage Format:

* **Design specs**: JSON + PNG previews (if applicable)
* **Code bundles**: ZIP archive containing complete feature implementation
* **Execution metadata**: Trace log JSON + agent state JSON + scoring breakdown
* **Download package**: Single ZIP file with all artifacts and execution details

---

### Release 1.0 (MVP) Scope:

#### **Core Agent Flow Requirements:**
* ✅ **Creative Brief Input**: Always available prompt input to start new agent flows
* ✅ **Automated Progression**: Agent flows automatically through all steps without manual advancement
* ✅ **Abort Control**: Prominent abort button available at any time during flow execution
* ✅ **Visual Progress Tracking**: Real-time step indicators with proper state management
  * Waiting state (gray) before processing begins
  * Active processing state (blue/animated) during AI computation
  * Completed state (green) for successful steps
  * Error state (red) for failed steps with detailed error messaging

#### **Step Results & Transparency:**
* ✅ **Interactive Step Review**: Click any completed step to view detailed input/output
* ✅ **Persistent Results Access**: Step results remain viewable throughout session
* ✅ **AI Decision Transparency**: Show reasoning, scoring, and selection criteria for each step
* ✅ **Non-Disruptive Inspection**: Review previous steps without interrupting automated flow

#### **Error Handling & User Feedback:**
* ✅ **Visual Error Indicators**: Failed steps display with red theme indicators
* ✅ **Error Details Section**: Dedicated area below flow timeline for error messaging
* ✅ **Actionable Error Messages**: Clear descriptions with guidance for users
* ✅ **Graceful Degradation**: Flow stops on errors but preserves access to successful steps

#### **Parallel Processing Display:**
* ✅ **3-box parallel processing display** for Figma and code generation
* ✅ **Real-time progress indicators** for each parallel process
* ✅ **Individual status tracking** for concurrent operations

#### **Core Features:**
* ✅ **Aggregate scoring system** for automatic selection
* ✅ **ZIP download** of complete artifacts (not GitHub PR)
* ✅ **Full run archive export** with execution trace
* ✅ **Execution storage in Azure Blob** with user-scoped paths
* ✅ **Parallel generation steps** (3 Figma specs + 3 code implementations)
* ✅ **Azure AI Foundry integration** (if possible)
* ✅ **Managed Identity** on Azure, DefaultAzureCredential for local
* ✅ **All executions and agent runs visible to all users** (MVP scope)
* ✅ **Infrastructure documented and provisioned manually** for MVP

#### **Technical Requirements:**
* ✅ No retries or edits for failed steps (planned for Release 1.1)
* ✅ No Storybook/test code generation (planned for Release 1.1)
* ✅ No multi-user isolation (planned for Release 1.1)

---

### Release 1.1 (Post-MVP) Scope:

* **Enhanced User Experience**
  * Individual file preview capabilities
  * Retry/modify steps and re-run failed executions
  * Multi-user execution isolation and privacy controls
  * Enhanced visual indicators and progress tracking

* **Advanced Features**
  * GitHub PR integration for code delivery
  * Storybook/test support in generated features
  * Multi-agent collaboration workflows
  * AI metrics dashboard per execution
  * Advanced scoring refinements and selection criteria

* **Infrastructure & DevOps**
  * Full Infrastructure as Code automation (e.g., Terraform, Bicep)
  * Cost optimization for blob cleanup policies
  * Automated token rotation for blob SAS
  * Performance monitoring and optimization

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

### Release 1.1 Enhancements (Post-MVP):

* Retry/modify steps and re-run
* GitHub PR integration
* Storybook/test support in generated feature
* Multi-agent collaboration
* AI metrics dashboard per execution
* Full Infrastructure as Code automation (e.g., Terraform, Bicep)
* Individual file preview capabilities
* Multi-user execution isolation and privacy controls

---

### Open Items:

* Which graph library will be selected (leave flexible for now)
* How to handle authentication/token rotation for blob SAS
* Cost optimization for blob cleanup policies

---

### Test-Driven Development & Validation Approach:

* The project will follow a **test-driven development (TDD)** methodology.
* Emphasis is on **integration testing** and **end-to-end validation** of actual functionality, rather than isolated unit tests.
* Tests should validate real user flows, agent pipeline execution, and integration with external services (e.g., Azure AI Foundry, Azure Blob Storage).
* Automated tests should cover:
  * Full agent pipeline execution (from creative brief to artifact download)
  * Visual execution tracking and UI state transitions
  * API and storage integration (mocked or real, as appropriate)
  * Accessibility and usability of generated UIs
* Unit testing is **not required** unless it directly supports integration or functional validation.
* when developing test driven development which is always needed, never use az cli commands since it doesn't work on codex, always use node and then DefaultAzureCredential, which works for everyone

---

### Code Architecture:

#### **Core Structure:**

* **Layered Architecture:** Clear separation of concerns with distinct layers:
  * **Data Access Objects (DAOs)** (`lib/daos/`): Interfaces with external services like Azure
  * **Business Services** (`lib/services/`): Core business logic implementation
  * **Utilities** (`lib/utils/`): Shared helper functions across the application
  * **Components** (`components/`): Reusable UI elements
  * **Features** (`features/`): Feature-specific modules and components

#### **Key Design Principles:**

* **Separation of Concerns:** Each layer has a distinct responsibility
  * DAOs handle external resource access (Azure AI, Blob Storage, Cosmos DB)
  * Services implement business logic and workflows
  * Utils provide shared functionality used across the application
* **Clean Interfaces:** Each module exposes a well-defined interface
* **Testability:** Separation facilitates unit testing of each layer
* **Maintainability:** Makes the codebase easier to understand, extend and refactor
* **Organized Test Suites:** Tests are grouped under `tests/dao`, `tests/services`, `tests/endpoints`, `tests/ui`, and `tests/e2e` with runner scripts. Execute all with `npm run test:all`.

#### **File Organization:**

```
lib/
├── daos/              # Data Access Objects for external services
│   ├── aiClient.ts    # Azure AI client wrapper
│   ├── azureClient.ts # Azure base client utilities
│   ├── cosmosClient.ts # Cosmos DB client
│   ├── storageClient.ts # Azure Blob Storage client
│   └── index.ts       # Re-exports for DAOs
├── services/          # Business logic implementation
│   ├── designConcept.ts # Design concept generation service
│   ├── designEvaluation.ts # Design evaluation service
│   ├── specSelection.ts # Design selection service
│   └── index.ts       # Re-exports for services
└── utils/             # Shared utilities
    ├── graphUtils.ts  # Graph/chart utilities
    ├── promptUtils.ts # AI prompt utilities
    └── index.ts       # Re-exports for utilities
```