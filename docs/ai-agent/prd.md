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

2. **Design Evaluation**

   * LLM scores and ranks multiple design concepts based on clarity, alignment with data types, and modifiability.

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

* Users see visual agent flow with active step indicators (e.g., blinking/highlighted).
* A collapsible timeline shows step start/end with timestamps.
* **Parallel Processing Display**: 3 boxes showing concurrent Figma spec generation and 3 boxes for code generation.
* **Abort Control**: Users can abort the entire agent flow at any time with a prominent abort button.
* Export full execution (Figma spec + code + summary trace).
* Users can revisit past runs via execution history.

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

/lib                     ← Core logic like API clients, Foundry wrapper
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

* **Design specs**: JSON + PNG previews (if applicable)
* **Code bundles**: ZIP archive containing complete feature implementation
* **Execution metadata**: Trace log JSON + agent state JSON + scoring breakdown
* **Download package**: Single ZIP file with all artifacts and execution details

---

### MVP Scope:

* ✅ Manual creative brief input
* ✅ Agent flow w/ visual indicators and abort functionality
* ✅ **3-box parallel processing display** for Figma and code generation
* ✅ **Aggregate scoring system** for automatic selection
* ✅ **ZIP download** of complete artifacts (not GitHub PR)
* ✅ Full run archive export with execution trace
* ✅ Execution storage in Azure Blob
* ✅ Parallel generation steps (3 Figma specs + 3 code implementations)
* ✅ Azure AI Foundry integration (if possible)
* ✅ Managed Identity on Azure, DefaultAzureCredential for local
* ✅ No retries or edits for failed steps (yet)
* ✅ No Storybook/test code (yet)
* ✅ All executions and agent runs visible to all users
* ✅ Infrastructure will be documented and provisioned manually for MVP
* ❌ Individual file preview (future enhancement)

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
