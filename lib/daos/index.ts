/**
 * Data Access Layer
 * 
 * This module exports all data access objects (DAOs) for the application.
 * It provides a clear interface for accessing external data sources like
 * Azure Storage, Azure OpenAI, and Cosmos DB.
 */

// Re-export all data access clients
export * from './aiClient';
export * from './azureClient';
export * from './cosmosClient';
export * from './storageClient';
