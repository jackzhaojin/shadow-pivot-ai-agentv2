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

- The agent progresses through defined steps (design concept, evaluation, figma specs, code generation, etc.).
- Context providers (`AgentFlowProvider`) manage global state and expose helper actions.
- A direct API triggering pattern ensures sequential calls fire reliably without waiting for React state batching.
- Step execution is orchestrated in `StepExecutor.tsx`. It calls the API routes
  in order and updates the provider state when each request succeeds.
- `AgentFlowTimeline.tsx` renders progress indicators and allows step detail
  toggling via utilities from `lib/utils/stepResults.ts`.

### Complex Step Implementation Patterns

For sophisticated steps requiring parallel processing (like Step 3.5 Figma Spec Generation):

- **Real Parallel Processing**: Use `Promise.all()` and `Promise.allSettled()` for true parallelization
- **Staggered Progress Updates**: Implement different intervals (200ms + index * 100ms) to prevent UI conflicts
- **Multi-Level State Management**: Provider-level global state + component-level progress tracking
- **Comprehensive Error Handling**: Individual process errors, partial failure handling, and meaningful fallbacks
- **Real-Time Progress Visualization**: Visual feedback with color-coded states and progress bars

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
- `figmaSpec.ts` demonstrates complex service implementation with AI integration,
  multiple JSON extraction strategies, and comprehensive error handling.
- `specSelection.ts` provides simple helpers for picking the best option.

### Service Implementation Best Practices

From Step 3.5 implementation learnings:

- **Comprehensive Logging**: Detailed console logging for debugging complex AI interactions
- **Multiple Parsing Strategies**: Handle various AI response formats with fallback mechanisms
- **Graceful Error Handling**: Always provide meaningful fallback content when AI calls fail
- **Template Integration**: Use prompt templates from `prompts/` for consistent AI interactions
- **Type Safety**: Strong TypeScript typing throughout service layer

## 5. Testing & Quality Assurance

- Baseline authentication tests verify Azure connectivity in all environments.
- Linting (`npm run lint`) and build checks (`npm run build`) are required before commits.
- Key issues and resolutions are documented in [Key Issue Resolution](../key-issue-resolution/).
- A comprehensive test suite under `tests/` exercises multiple layers:
  - **DAO Layer**: `tests/dao/ai-connection.test.js` for Azure connectivity
  - **Endpoints**: `tests/endpoints/` for API route testing
  - **Services**: `tests/services/` for business logic validation
  - **UI**: `tests/ui/` for component and integration testing
- Run all tests with `npm run test:all` or specific categories with dedicated runners.

### Testing Strategy for Complex Features

Lessons from Step 3.5 comprehensive testing:

- **Multi-Layer Testing**: Cover API endpoints, service logic, state management, and UI components
- **Error Scenario Coverage**: Test partial failures, network errors, and AI response parsing failures
- **State Management Validation**: Verify provider state updates and component synchronization
- **Performance Testing**: Validate parallel processing performance vs. sequential alternatives
- **Quality Validation**: Test output quality and structure, not just functionality

## 6. Prompt Template System

- Prompt templates stored in `prompts/` are loaded via
  `lib/utils/promptUtils.ts`.
- Templates define a system prompt, a user prompt template and expected response
  shape which is validated after calling the LLM.
- This ensures repeatable AI requests and easier debugging of parsing failures.

### Advanced Prompt Engineering Patterns

Enhanced patterns from Step 3.5 implementation:

- **Professional Domain Expertise**: Templates incorporate specific domain knowledge (UX/UI design principles)
- **Modern Standards Integration**: Include accessibility, responsive design, and current best practices
- **Structured Response Formats**: Use JSON schemas to enforce consistent AI output structure
- **Temperature Optimization**: Fine-tune creativity vs. consistency for different use cases
- **Multi-Strategy Parsing**: Handle various AI response formats with extraction fallbacks

## 7. State Management Architecture

Advanced state management patterns for complex features:

### Provider Pattern Implementation
- **Global State**: Use React Context providers for cross-component state sharing
- **Type Safety**: Strong TypeScript interfaces for all state objects
- **State Isolation**: Separate concerns (e.g., `figmaSpecs` vs `figmaSpecStates`)
- **Update Patterns**: Immutable state updates with proper React patterns

### Component State Coordination
- **Multi-Level State**: Provider (global) + Component (local) + Process (individual) levels
- **State Synchronization**: useEffect hooks for coordinating between async processes
- **Progress Tracking**: Real-time state updates during long-running operations
- **Error State Management**: Comprehensive error state handling across all levels

## 8. Performance & User Experience Patterns

### Real-Time Feedback Systems
- **Progress Visualization**: Real-time progress bars with meaningful status updates
- **Staggered Updates**: Prevent UI conflicts with offset timing (200ms + index * 100ms)
- **Visual State Indicators**: Color-coded status (waiting, processing, completed, error)
- **Responsive Design**: Grid layouts that work across device sizes

### Error Resilience Patterns
- **Partial Failure Handling**: Use `Promise.allSettled()` for graceful degradation
- **Meaningful Fallbacks**: Provide useful content even when processes fail
- **Error Recovery**: Clear error messaging with actionable information
- **Progressive Enhancement**: Features work with reduced functionality during failures

## 9. Agent Step Timeline Architecture

Visual representation of how complex agent steps are implemented in the timeline workflow.

### Architecture Diagrams

#### Sequence Diagram: Complex Agent Step Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant AgentFlow as AgentFlow.tsx
    participant Timeline as AgentFlowTimeline.tsx
    participant StepExecutor as StepExecutor.tsx
    participant Provider as AgentFlowProvider.tsx
    participant ProcessGrid as ProcessGrid.tsx
    participant ProcessBox as ProcessBox.tsx
    participant API as /api/agent/step-endpoint
    participant Service as stepService.ts
    participant PromptUtils as promptUtils.ts
    participant Template as template.json
    participant AIClient as aiClient.ts
    participant Azure as Azure OpenAI

    User->>AgentFlow: Navigate to /agent
    AgentFlow->>Provider: Initialize state
    Provider->>Timeline: Render timeline
    Timeline->>StepExecutor: Mount executor

    Note over StepExecutor: Step N conditions met
    StepExecutor->>Provider: setProcessStates([waiting, waiting, waiting])
    Provider->>ProcessGrid: Update states
    ProcessGrid->>ProcessBox: Render 3 boxes (waiting)

    Note over StepExecutor: Start parallel processing
    StepExecutor->>Provider: setProcessStates([processing, processing, processing])
    
    par Parallel Process 1
        StepExecutor->>API: POST /step-endpoint (index 0)
        API->>Service: generateResults(input, 1, context)
        Service->>PromptUtils: loadPromptTemplate('template.json')
        PromptUtils->>Template: Read template file
        Template-->>PromptUtils: Return template object
        PromptUtils->>Service: Apply template with variables
        Service->>AIClient: generateChatCompletion(messages, options)
        AIClient->>Azure: Chat completion request
        Azure-->>AIClient: AI response
        AIClient-->>Service: Response object
        Service->>Service: Parse JSON with multiple strategies
        Service-->>API: Result object
        API-->>StepExecutor: { results: [result] }
        StepExecutor->>Provider: Update index 0 progress to 100%
    and Parallel Process 2
        StepExecutor->>API: POST /step-endpoint (index 1)
        Note over API,Azure: Same flow as Process 1
        API-->>StepExecutor: { results: [result] }
        StepExecutor->>Provider: Update index 1 progress to 100%
    and Parallel Process 3
        StepExecutor->>API: POST /step-endpoint (index 2)
        Note over API,Azure: Same flow as Process 1
        API-->>StepExecutor: { results: [result] }
        StepExecutor->>Provider: Update index 2 progress to 100%
    end

    Note over StepExecutor: All processes complete
    StepExecutor->>Provider: setStepResults([result1, result2, result3])
    StepExecutor->>Provider: completeStep(N)
    Provider->>Timeline: Update step N as completed
    Provider->>ProcessGrid: Show completed states
    ProcessGrid->>ProcessBox: Render completed (green)

    User->>Timeline: Click Step N to view results
    Timeline->>StepResultPanel: Show step results
    StepResultPanel->>User: Display generated results
```

#### Class Diagram: Agent Step Component Architecture

```mermaid
classDiagram
    class AgentFlowProvider {
        +stepResults: StepResult[]
        +processStates: ProcessState[]
        +setStepResults(results: StepResult[]): void
        +setProcessStates(states: ProcessState[]): void
        +completeStep(stepNumber: number): void
        +currentStep: number
        +selectedInput: string
    }

    class AgentFlow {
        +render(): JSX.Element
        -useContext(AgentFlowProvider)
    }

    class AgentFlowTimeline {
        +steps: StepInfo[]
        +render(): JSX.Element
        -handleStepClick(stepNumber: number): void
    }

    class StepExecutor {
        -useEffect(): void
        -executeStepParallel(): Promise<void>
        -triggerStepExecution(input: string): Promise<void>
    }

    class ProcessGrid {
        +states: ProcessState[]
        +render(): JSX.Element
    }

    class ProcessBox {
        +index: number
        +state: ProcessState
        +render(): JSX.Element
    }

    class StepResultPanel {
        +stepNumber: number
        +render(): JSX.Element
        -renderStepResults(): JSX.Element
    }

    class APIRoute {
        +POST(req: Request): Promise<Response>
        -extractInput(body: any): string
        -extractContext(body: any): string
    }

    class StepService {
        +generateResult(input: string, context: string): Promise<StepResult>
        +generateResults(input: string, count: number, context: string): Promise<StepResult[]>
        -parseAIResponse(content: string): StepResult
        -createFallbackResult(input: string): StepResult
    }

    class PromptUtils {
        +loadPromptTemplate(path: string): PromptTemplate
        +applyTemplate(template: PromptTemplate, variables: object): AppliedTemplate
        +validateResponse(data: any, template: PromptTemplate): ValidationResult
    }

    class AIClient {
        +generateChatCompletion(messages: Message[], options: CompletionOptions): Promise<ChatCompletion>
        -client: OpenAIClient
    }

    class ProcessState {
        +progress: number
        +status: 'waiting' | 'processing' | 'completed' | 'error'
    }

    class StepResult {
        +id: string
        +content: string
        +metadata: object
    }

    class PromptTemplate {
        +version: string
        +name: string
        +systemPrompt: string
        +userPromptTemplate: string
        +responseFormat: object
        +temperature: number
    }

    class ProcessUtils {
        +createProcessStateArray(count: number): ProcessState[]
        +updateProcessProgress(states: ProcessState[], index: number, progress: number, error?: string): ProcessState[]
    }

    %% Provider Relationships
    AgentFlowProvider --o AgentFlow
    AgentFlowProvider --o AgentFlowTimeline
    AgentFlowProvider --o StepExecutor
    AgentFlowProvider --o StepResultPanel

    %% Component Composition
    AgentFlow --* AgentFlowTimeline
    AgentFlow --* StepExecutor
    AgentFlowTimeline --* StepResultPanel

    %% UI Component Hierarchy
    StepExecutor --* ProcessGrid
    ProcessGrid --o ProcessBox

    %% Service Dependencies
    StepExecutor --> APIRoute
    APIRoute --> StepService
    StepService --> PromptUtils
    StepService --> AIClient
    PromptUtils --> PromptTemplate

    %% Data Associations
    AgentFlowProvider *-- StepResult
    AgentFlowProvider *-- ProcessState
    ProcessBox --> ProcessState
    StepService --> StepResult
    StepExecutor --> ProcessUtils

    %% Async Data Flow
    StepExecutor ..> AgentFlowProvider
    APIRoute ..> StepService
    StepService ..> AIClient
```

#### Data Flow Diagram: Template to AI Response Processing

```mermaid
flowchart TD
    A[StepExecutor triggers processing] --> B[API Route /api/agent/step-endpoint]
    B --> C[stepService.ts service]
    
    C --> D[loadPromptTemplate template.json]
    D --> E[Read prompts/step-templates/template.json]
    E --> F[PromptTemplate Object]
    
    F --> G[applyTemplate with input and context]
    G --> H[Handlebars template substitution]
    H --> I[Applied System and User Prompts]
    
    I --> J[generateChatCompletion call]
    J --> K[Azure OpenAI API]
    K --> L[Raw AI Response]
    
    L --> M{Parse JSON Response}
    M -->|Success| N[Valid StepResult]
    M -->|Parse Error| O[Try Code Block Extraction]
    O -->|Success| N
    O -->|Still Failed| P[Try JSON Object Extraction]
    P -->|Success| N
    P -->|Still Failed| Q[Create Fallback Result]
    Q --> R[Fallback StepResult]
    
    N --> S[validateResponse against schema]
    R --> S
    S --> T[Return StepResult to API]
    T --> U[API returns to StepExecutor]
    U --> V[Update Provider State]
    V --> W[UI reflects completion]

    %% Template Structure
    subgraph Template [template.json Structure]
        T1[systemPrompt: Domain expertise]
        T2[userPromptTemplate with variables]
        T3[responseFormat: JSON schema]
        T4[temperature: optimization value]
    end
    
    E -.-> Template
    
    %% Error Handling
    subgraph ErrorHandling [Error Resilience]
        E1[Individual Process Errors]
        E2[Promise.allSettled handling]
        E3[Meaningful Fallback Content]
        E4[UI Error State Indicators]
    end
    
    Q -.-> ErrorHandling
```

---

## Development Guidelines

### Building Complex Pipeline Steps

Based on Step 3.5 implementation analysis, follow these patterns for sophisticated features:

1. **Real Functionality First**: Never implement simulation - build actual functionality from the start
2. **Error-First Design**: Plan comprehensive error handling before implementing happy path
3. **State Management Strategy**: Use provider pattern for complex multi-component state
4. **Progress Feedback**: Implement real-time user feedback for long-running operations
5. **Comprehensive Testing**: Cover all scenarios including edge cases and partial failures
6. **Performance Optimization**: Consider parallel processing and user experience impacts

### Code Quality Standards

- **TypeScript Compliance**: Strong typing throughout all layers
- **Error Boundaries**: Graceful error handling with meaningful user feedback
- **Performance Awareness**: Optimize for user experience and perceived performance
- **Test Coverage**: High coverage with realistic scenarios, not just unit tests
- **Documentation**: Clear technical documentation for complex architectural decisions

For detailed implementation examples, see:
- [Step 3.5 Implementation Analysis](./step-3.5-implementation-analysis.md) for complex parallel processing patterns
- Individual documents in this `blueprint` directory for specific architectural decisions
- The PRD for feature specifications and requirements
