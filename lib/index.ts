/**
 * Main library exports
 * 
 * This file re-exports all modules from the new directory structure
 * for backward compatibility with code that still imports from the
 * root lib directory.
 */

// Re-export all modules
// Export the Azure client first as it already includes storage client exports
export * from './daos/azureClient';
export * from './daos/aiClient';
export * from './daos/cosmosClient';

// Re-export all services
export * from './services/designConcept';
export * from './services/designEvaluation';
export * from './services/specSelection';

// Re-export all utils
export * from './utils/graphUtils';
export * from './utils/promptUtils';
