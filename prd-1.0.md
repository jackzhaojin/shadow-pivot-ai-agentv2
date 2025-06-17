**Product Requirements Document (PRD) - Release 1.0 (MVP)**

---

### Project Title: AI UI Agent with Visual Execution - MVP

### Overview:

An AI-powered design-to-code agent embedded within a Next.js app, capable of generating visual UIs (graphs/tables) for web apps. The app guides users through a multistep agent pipeline with visual execution tracking, enabling retryable design/code cycles. **Release 1.0 (MVP) focuses on Figma spec generation and download only - no code generation or Azure Blob Storage integration.**

---

### Goals:

* Use AI to propose, evaluate, and implement UI design concepts with visual execution tracking.
* Support a step-based AI agent with a visual trace and execution log.
* Enable Figma spec download (no code generation in MVP).
* Support both SSR and CSR within Next.js 15.1.8 using the App Router.
* **MVP Constraint**: No Azure Blob Storage integration - all data stored locally/in-memory during session.

---

### 📚 Documentation Structure:

This PRD focuses on **Release 1.0 MVP requirements and high-level technical design**. For detailed technical implementation:

- **[Technical Documentation](docs/technical/README.md)** - Index of implementation guides and key issue resolutions
- **[Technical Blueprint](docs/technical/blueprint/README.md)** - Core capabilities and architecture patterns
- **[AGENTS.md](AGENTS.md)** - Development guidelines, folder structure, and contribution standards  
- **[AI Development Logs](docs/ai-log/)** - Session-by-session development history and decision tracking
- **[Release 1.0 Task Management](release-1.0.mdc)** - MVP implementation roadmap and progress tracking

---

### Key Features (MVP Release 1.0):

#### Agent Pipeline (Simplified for MVP):

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

5. **Download Artifacts (MVP Scope)**

   * **Figma spec download only**: Selected Figma specifications in downloadable format.
   * **Full execution trace**: Detailed log of all agent decisions and evaluations.
   * **No code generation**: Code generation moved to Release 1.1.
   * **No Azure Blob Storage**: All execution data stored in-memory during session.

#### User Experience (MVP):

* **Agent Input & Flow Control:**
  * Users can always enter a creative brief to start a new AI agent flow
  * Users can abort the entire agent flow at any time with a prominent abort button
  * **No manual step advancement**: Agent automatically progresses through all steps without user intervention
  * Users can start multiple flows sequentially (previous flow data available during session only)

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
  * **Toggle details view**: Users can show/hide detailed results using a "View/Hide Details" toggle button
  * **Step validation in modal**: Validation controls appear in a modal dialog when users choose to validate a step

* **Error Handling & Feedback:**
  * **Error visualization**: Failed steps appear with red indicators and error messaging
  * Error details displayed below the main flow timeline in a dedicated error section
  * Clear error descriptions with actionable guidance for users
  * Flow stops on errors but allows users to review previous successful steps

* **Parallel Processing Display:**
  * **3 boxes showing concurrent Figma spec generation** with real-time progress indicators
  * Each parallel process shows individual status and completion indicators
  * **No parallel code generation boxes**: Removed for MVP scope

* **Execution Management (MVP):**
  * Export Figma spec and summary trace
  * Users can revisit current session runs (no persistent storage)
  * **Download capability**: Figma specifications and execution trace

#### Agent Testing & Evaluation Criteria (MVP):

**Figma Spec Testing:**
* Design clarity and visual hierarchy
* Component structure and reusability
* Alignment with modern UI/UX principles
* Technical feasibility for future code generation

**Aggregate Scoring System (MVP):**
* Figma spec evaluation and ranking only
* Automatic selection of highest-scoring specification
* Detailed scoring breakdown available in execution trace

---

### Technical Design (MVP):

#### App Architecture:

* Framework: **Next.js 15.1.8** with App Router.
* Styling: **TailwindCSS** (via `npx` setup).
* Agent Flow UI: SSR for baseline, CSR for interaction/live updates.
* Data Visualization: Open (Recharts/D3/others allowed).
* **No persistent storage**: All data stored in-memory during session.

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

/hooks                   ← Global shared custom hooks

/lib                     ← Core logic and business layers

  /daos                  ← Data Access Objects for external services (Azure AI only for MVP)
    - Example: `aiClient.ts` wraps Azure AI Foundry LLM calls and prompt orchestration.
    - Example: `azureClient.ts` sets up Azure SDK clients using DefaultAzureCredential.
    - **MVP Note**: No storageClient.ts or cosmosClient.ts needed.

  /services              ← Business logic and agent workflow orchestration
    - Example: `designConcept.ts` generates multiple UI design concepts from a creative brief.
    - Example: `designEvaluation.ts` scores and ranks design concepts for clarity and modifiability.
    - Example: `figmaSpec.ts` runs parallel Figma spec generation and validates usability.
    - Example: `specSelection.ts` selects the optimal Figma spec based on agent evaluation.
    - Example: `executionTrace.ts` aggregates logs, scoring, and trace data for export.
    - **MVP Note**: No codeGeneration.ts or codeSelection.ts needed.

  /utils                 ← Shared utilities and helpers
    - Example: `graphUtils.ts` provides chart/graph data shaping and library adapters.
    - Example: `promptUtils.ts` manages AI prompt templates and formatting.
    - Example: `scoringUtils.ts` implements aggregate scoring and metric weighting.
    - Example: `fileUtils.ts` handles file formatting and download helpers.

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

#### Backend & AI (MVP):

* AI Integration: Uses **Azure AI Foundry** if available.
* Authentication:

  * **Managed Identity** on Azure server.
  * **DefaultAzureCredential** for local development:

    * If you are Codex: Uses Service Principal credentials (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
    * If you are local user or github co pilot: Uses az login
    * Automatically resolves to Managed Identity on Azure App Service
    * Enables unified credential usage across environments
* **No Storage**: MVP does not use Azure Blob Storage - all data in-memory during session
* AI Step Computation:

  * Parallel Figma generation where applicable
  * Decision steps marked with visual nodes

#### Local Development Notes:

* When running `npm run dev`, `DefaultAzureCredential` resolves to your Service Principal credentials.
* Developers should set environment variables: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID.
* For debugging auth, use `AZURE_LOG_LEVEL=verbose npm run dev` to confirm which credential is being used.
* SDK calls must be made only within server components or API routes (never client components).
* When developing with test driven development, always use Node.js and DefaultAzureCredential instead of az CLI commands, since they work reliably across all environments

#### User Identity (MVP):

* Each user assigned a GUID ID (shown in UI)
* **No persistent storage**: User data only available during session

#### Recent Technical Improvements:

> 📋 **Note**: For detailed technical implementation guides and debugging resources, see **[Technical Documentation](docs/technical/README.md)**

* ✅ **React State Synchronization Fix** (June 15, 2025): Resolved critical issue where Step 2 (Design Evaluation) API calls weren't triggering after Step 1 completion. Implemented direct API triggering pattern to bypass React context batching issues.
  - **Details**: [`react-state-synchronization-fix.md`](docs/technical/key-issue-resolution/react-state-synchronization-fix.md)
  - **Impact**: Ensures reliable automated flow progression without user intervention

* ✅ **Step Validation Feature**: Added ability for users to validate/invalidate completed steps with feedback mechanisms and visual indicators in timeline.

* ✅ **Enhanced Error Handling**: Improved debugging capabilities with comprehensive logging throughout the agent flow execution.

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
* ✅ **Toggle Details View**: Toggle between showing and hiding step details with a View/Hide Details button
* ✅ **Modal Validation**: Present validation controls in a modal dialog for focused user interaction

#### **Error Handling & User Feedback:**
* ✅ **Visual Error Indicators**: Failed steps display with red theme indicators
* ✅ **Error Details Section**: Dedicated area below flow timeline for error messaging
* ✅ **Actionable Error Messages**: Clear descriptions with guidance for users
* ✅ **Graceful Degradation**: Flow stops on errors but preserves access to successful steps

#### **Parallel Processing Display:**
* ✅ **3-box parallel processing display** for Figma generation
* ✅ **Real-time progress indicators** for each parallel process
* ✅ **Individual status tracking** for concurrent operations

#### **Core Features (MVP):**
* ✅ **Aggregate scoring system** for automatic Figma spec selection
* ✅ **Figma spec download** (not code or GitHub PR)
* ✅ **Full run trace export** with execution details
* ✅ **In-memory execution storage** during session (no Azure Blob)
* ✅ **Parallel Figma spec generation** (3 specs in parallel)
* ✅ **Azure AI Foundry integration** (if possible)
* ✅ **Managed Identity** on Azure, DefaultAzureCredential for local
* ✅ **All executions visible to all users** during session (MVP scope)
* ✅ **Infrastructure documented and provisioned manually** for MVP

#### **Technical Requirements (MVP):**
* ✅ No retries or edits for failed steps (planned for Release 1.1)
* ✅ No code generation (moved to Release 1.1)
* ✅ No Azure Blob Storage (moved to Release 1.1)
* ✅ No multi-user isolation (planned for Release 1.1)

---

### Deployment & Infrastructure Notes (MVP):

* A `Dockerfile` and `.dockerignore` will be included to support containerized builds and deployments.

* GitHub Actions will be used to automate Docker-based deployments.

* We will reuse and adapt the proven code and patterns from the following working examples:

  * GitHub Actions Workflow: [main\_shadow-pivot-nextjsv2.yml](https://github.com/jackzhaojin/shadow-pivot-nextjs/blob/main/.github/workflows/main_shadow-pivot-nextjsv2.yml)
  * Dockerfile: [Dockerfile](https://github.com/jackzhaojin/shadow-pivot-nextjs/blob/main/Dockerfile)
  * Docker Ignore File: [.dockerignore](https://github.com/jackzhaojin/shadow-pivot-nextjs/blob/main/.dockerignore)

* An `infrastructure.md` file will be included in the codebase to guide developers through setting up the necessary Azure resources:

  * Azure AI Foundry (primary requirement for MVP)
  * Managed Identities
  * User permissions and roles
  * **No Azure Storage Account needed for MVP**

* Full Infrastructure as Code (IaC) will be developed post-MVP.

---

### Test-Driven Development & Validation Approach (MVP):

* The project will follow a **test-driven development (TDD)** methodology.
* Emphasis is on **integration testing** and **end-to-end validation** of actual functionality, rather than isolated unit tests.
* Tests should validate real user flows, agent pipeline execution, and integration with external services (e.g., Azure AI Foundry).
* Automated tests should cover:
  * Full agent pipeline execution (from creative brief to Figma spec download)
  * Visual execution tracking and UI state transitions
  * API and AI service integration (mocked or real, as appropriate)
  * Accessibility and usability of generated UIs
* Unit testing is **not required** unless it directly supports integration or functional validation.
* when developing test driven development which is always needed, never use az cli commands since it doesn't work on codex, always use node and then DefaultAzureCredential, which works for everyone

---

### Code Architecture (MVP):

#### **Core Structure:**

* **Layered Architecture:** Clear separation of concerns with distinct layers:
  * **Data Access Objects (DAOs)** (`lib/daos/`): Interfaces with external services like Azure AI
  * **Business Services** (`lib/services/`): Core business logic implementation
  * **Utilities** (`lib/utils/`): Shared helper functions across the application
  * **Components** (`components/`): Reusable UI elements
  * **Features** (`features/`): Feature-specific modules and components

#### **Key Design Principles:**

* **Separation of Concerns:** Each layer has a distinct responsibility
  * DAOs handle external resource access (Azure AI only for MVP)
  * Services implement business logic and workflows
  * Utils provide shared functionality used across the application
* **Clean Interfaces:** Each module exposes a well-defined interface
* **Testability:** Separation facilitates unit testing of each layer
* **Maintainability:** Makes the codebase easier to understand, extend and refactor
* **Organized Test Suites:** Tests are grouped under `tests/baseline`, `tests/dao`, `tests/services`, `tests/endpoints`, `tests/ui`, and `tests/e2e` with runner scripts. Execute all with `npm run test:all`.

#### **File Organization (MVP):**

```
lib/
├── daos/              # Data Access Objects for external services
│   ├── aiClient.ts    # Azure AI client wrapper
│   ├── azureClient.ts # Azure base client utilities
│   └── index.ts       # Re-exports for DAOs
├── services/          # Business logic implementation
│   ├── designConcept.ts # Design concept generation service
│   ├── designEvaluation.ts # Design evaluation service  
│   ├── figmaSpec.ts   # Figma spec generation service
│   ├── specSelection.ts # Figma spec selection service
│   ├── executionTrace.ts # Execution tracking service
│   └── index.ts       # Re-exports for services
└── utils/             # Shared utilities
    ├── graphUtils.ts  # Graph/chart utilities
    ├── promptUtils.ts # AI prompt utilities
    ├── scoringUtils.ts # Scoring and evaluation utilities
    ├── fileUtils.ts   # File download utilities
    └── index.ts       # Re-exports for utilities
```

---

### Open Items (MVP):

* Which graph library will be selected (leave flexible for now)
* How to handle authentication/token management for AI services
* Session management without persistent storage

---

### Future Releases:

* **Release 1.1**: Stabilization release - Cypress testing, React state fixes, refactoring
* **Release 1.2**: User session management, persistent Figma files, session history display
* **Release 1.3**: Code generation, upload/download code samples
* **Backlog**: All other advanced features (GitHub integration, multi-agent, enterprise features)
