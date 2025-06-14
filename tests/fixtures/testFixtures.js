/**
 * Test Fixtures Manager
 * 
 * This module provides reusable test data and utilities for different test categories.
 * Centralizing test data here allows for easier maintenance and consistent test scenarios.
 */

/**
 * AI Fixtures
 */
const aiFixtures = {
  // Mock design concept inputs
  designConceptInputs: {
    brief: "Create a modern dashboard for stock market data visualization",
    userRequirements: ["Real-time data updates", "Mobile responsive", "Dark mode support"],
    designStyle: "Modern, clean, with dark mode"
  },
  
  // Mock design concept outputs
  designConceptOutputs: [
    {
      id: "concept-1",
      title: "Data-Focused Grid Layout",
      description: "A grid-based dashboard with emphasis on data visualization...",
      components: ["Stock tickers", "Interactive charts", "News feed"],
      colorScheme: ["#121212", "#2196F3", "#4CAF50", "#FFC107"],
      typography: "Roboto, Inter",
      layout: "Grid-based with fixed sidebar"
    },
    {
      id: "concept-2",
      title: "Card-Based Modular Design",
      description: "A card-based approach with draggable modules...",
      components: ["Draggable cards", "Widget customization", "Summary statistics"],
      colorScheme: ["#1E1E1E", "#3F51B5", "#E91E63", "#00BCD4"],
      typography: "Poppins, Montserrat",
      layout: "Fluid card-based layout"
    },
    {
      id: "concept-3",
      title: "Minimalist Focus View",
      description: "A minimalist approach highlighting key metrics...",
      components: ["Focused KPIs", "Simplified charts", "Contextual insights"],
      colorScheme: ["#0A0A0A", "#FF5722", "#03A9F4", "#8BC34A"],
      typography: "SF Pro Display, SF Pro Text",
      layout: "Single-column with expandable sections"
    }
  ],
  
  // Mock evaluation results
  designEvaluationResults: {
    concepts: [
      {
        id: "concept-1",
        scores: {
          usability: 8.7,
          aesthetics: 8.2,
          functionality: 9.1,
          innovation: 7.5,
          feasibility: 8.9
        },
        totalScore: 8.48,
        strengths: ["Excellent data visualization", "Intuitive navigation"],
        weaknesses: ["Could be overwhelming on mobile devices"],
        recommendation: "Best for data-focused users"
      },
      {
        id: "concept-2",
        scores: {
          usability: 9.0,
          aesthetics: 8.8,
          functionality: 8.3,
          innovation: 8.7,
          feasibility: 8.2
        },
        totalScore: 8.60,
        strengths: ["High customizability", "Modern aesthetic"],
        weaknesses: ["More complex implementation"],
        recommendation: "Best for personalization-oriented users"
      },
      {
        id: "concept-3",
        scores: {
          usability: 9.2,
          aesthetics: 7.9,
          functionality: 7.8,
          innovation: 7.2,
          feasibility: 9.4
        },
        totalScore: 8.30,
        strengths: ["Extremely focused", "Fastest implementation"],
        weaknesses: ["Limited feature set"],
        recommendation: "Best for minimalist approach"
      }
    ],
    weights: {
      usability: 0.25,
      aesthetics: 0.20,
      functionality: 0.25,
      innovation: 0.15,
      feasibility: 0.15
    },
    recommendation: "concept-2"
  }
};

/**
 * Azure Fixtures
 */
const azureFixtures = {
  // Mock storage blob metadata
  blobMetadata: {
    name: 'test-blob-12345',
    contentType: 'application/json',
    contentLength: 2048,
    lastModified: new Date(),
    etag: '0x8DB4567890ABCDEF',
    url: 'https://storageaccount.blob.core.windows.net/container/test-blob-12345'
  },
  
  // Mock storage container metadata
  containerMetadata: {
    name: 'executions',
    lastModified: new Date(),
    etag: '0x8DA9876543210CBA'
  },
  
  // Mock blob content
  blobContent: JSON.stringify({
    executionId: '12345-abcde-67890',
    status: 'completed',
    results: {
      designConcepts: [],
      evaluations: [],
      selectedConcept: 'concept-2'
    },
    timestamp: new Date().toISOString()
  })
};

/**
 * User Fixtures
 */
const userFixtures = {
  // Mock user data
  userGuid: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'u-550e8400',
  userPreferences: {
    theme: 'dark',
    notifications: true,
    savedBriefs: ['brief-1', 'brief-2']
  }
};

/**
 * Helper Functions
 */

/**
 * Creates mock execution data for testing
 * @param {string} executionId - Optional execution ID (will generate if not provided)
 * @param {string} status - Status of the execution
 * @returns {Object} Mock execution data
 */
function createMockExecution(executionId = null, status = 'completed') {
  const id = executionId || `exec-${Math.random().toString(36).substring(2, 10)}`;
  return {
    id,
    status,
    timestamp: new Date().toISOString(),
    steps: [
      { name: 'design-concept', status: 'completed', timestamp: new Date().toISOString() },
      { name: 'design-evaluation', status: 'completed', timestamp: new Date().toISOString() },
      { name: 'spec-selection', status: 'completed', timestamp: new Date().toISOString() },
      { name: 'code-generation', status: status === 'completed' ? 'completed' : 'pending', timestamp: status === 'completed' ? new Date().toISOString() : null }
    ],
    data: {
      brief: aiFixtures.designConceptInputs.brief,
      designConcepts: aiFixtures.designConceptOutputs,
      evaluations: aiFixtures.designEvaluationResults
    }
  };
}

module.exports = {
  ai: aiFixtures,
  azure: azureFixtures,
  user: userFixtures,
  helpers: {
    createMockExecution
  }
};
