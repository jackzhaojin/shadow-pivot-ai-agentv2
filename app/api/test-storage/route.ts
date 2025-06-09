import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export async function GET() {
  try {
    // Test Azure Storage connection using DefaultAzureCredential
    const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'shadowpivotaiagentstrg';
    const credential = new DefaultAzureCredential();
    
    // Create BlobServiceClient
    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      credential
    );

    // Test basic operations
    const containerName = 'executions';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Test container exists and we can access it
    const containerExists = await containerClient.exists();
    
    if (!containerExists) {
      return NextResponse.json({
        success: false,
        error: `Container '${containerName}' does not exist`,
        storageAccount: storageAccountName
      }, { status: 404 });
    }

    // Test write operation - create a test blob
    const testBlobName = `test-${Date.now()}.txt`;
    const testContent = `Test blob created at ${new Date().toISOString()}`;
    const blockBlobClient = containerClient.getBlockBlobClient(testBlobName);
    
    await blockBlobClient.upload(testContent, testContent.length);

    // Test read operation - read the blob back
    const downloadResponse = await blockBlobClient.download();
    const downloadedContent = await streamToString(downloadResponse.readableStreamBody!);

    // Test delete operation - clean up test blob
    await blockBlobClient.delete();

    return NextResponse.json({
      success: true,
      message: 'Azure Storage connection successful',
      details: {
        storageAccount: storageAccountName,
        container: containerName,
        containerExists: true,
        testBlobCreated: testBlobName,
        testContentMatches: downloadedContent.trim() === testContent,
        testBlobDeleted: true
      }
    });

  } catch (error: any) {
    console.error('Azure Storage test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      details: {
        storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME || 'shadowpivotaiagentstrg',
        container: 'executions'
      }
    }, { status: 500 });
  }
}

// Helper function to convert stream to string
async function streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks).toString());
    });
    readableStream.on('error', reject);
  });
}
