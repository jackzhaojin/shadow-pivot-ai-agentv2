/**
 * Azure Storage Integration Tests
 * 
 * Tests connectivity and operations with Azure Blob Storage.
 * These tests require valid Azure credentials configured.
 */

const assert = require('assert');
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running Azure Storage integration tests...');

// Configuration (should be loaded from environment variables in production)
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'shadowpivotaiagentstrg';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'executions';
const testBlobName = `test-blob-${Date.now()}.json`;

/**
 * Test case: Should connect to Azure Blob Storage
 */
async function testAzureBlobConnection() {
  console.log('  ⏳ Testing Azure Blob Storage connection...');
  
  try {
    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      credential
    );
    
    // List containers to verify connection
    const containers = [];
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
    }
    
    assert.ok(containers.length > 0, 'Expected to find at least one container');
    console.log(`  📊 Found ${containers.length} containers in storage account`);
    console.log('  ✅ Azure Blob Storage connection successful');
    
    return blobServiceClient;
  } catch (error) {
    console.error(`  ❌ Azure Blob Storage connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test case: Should perform blob operations (create, read, delete)
 */
async function testBlobOperations(blobServiceClient) {
  console.log('  ⏳ Testing blob operations (create, read, delete)...');
  
  try {
    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    
    if (!exists) {
      console.log(`  ⚠️ Container '${containerName}' doesn't exist, creating it...`);
      await containerClient.create();
    }
    
    // Upload a test blob
    const blobClient = containerClient.getBlockBlobClient(testBlobName);
    const testContent = JSON.stringify(fixtures.azure.blobContent);
    await blobClient.upload(testContent, testContent.length);
    console.log(`  📤 Uploaded test blob: ${testBlobName}`);
    
    // Download and verify the blob
    const downloadResponse = await blobClient.download(0);
    const downloadedContent = await streamToString(downloadResponse.readableStreamBody);
    assert.strictEqual(downloadedContent, testContent, 'Downloaded content should match uploaded content');
    console.log('  📥 Downloaded and verified blob content');
    
    // Delete the test blob
    await blobClient.delete();
    console.log(`  🗑️ Deleted test blob: ${testBlobName}`);
    
    console.log('  ✅ Blob operations successful');
  } catch (error) {
    console.error(`  ❌ Blob operations failed: ${error.message}`);
    throw error;
  }
}

// Helper to convert a readable stream to a string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

// Run the tests
(async function() {
  try {
    const blobServiceClient = await testAzureBlobConnection();
    await testBlobOperations(blobServiceClient);
    console.log('✅ All Azure Storage tests completed successfully');
    
    // Don't exit here since this file will be required by the test runner
  } catch (error) {
    console.error(`❌ Azure Storage tests failed: ${error.message}`);
    throw error;
  }
})();
