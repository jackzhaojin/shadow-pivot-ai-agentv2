import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export function getBlobServiceClient() {
  const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'shadowpivotaiagentstrg';
  const credential = new DefaultAzureCredential();
  
  return new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    credential
  );
}

export function getExecutionsContainer(): ContainerClient {
  const blobServiceClient = getBlobServiceClient();
  return blobServiceClient.getContainerClient('executions');
}

// Utility functions for common storage operations
export async function uploadTextBlob(containerName: string, blobName: string, content: string) {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  return await blockBlobClient.upload(content, Buffer.byteLength(content));
}

export async function downloadTextBlob(containerName: string, blobName: string): Promise<string> {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  const downloadResponse = await blockBlobClient.download();
  return await streamToString(downloadResponse.readableStreamBody!);
}

export async function deleteBlob(containerName: string, blobName: string) {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  return await blockBlobClient.delete();
}

export async function listBlobs(containerName: string, prefix?: string) {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  const blobs = [];
  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    blobs.push(blob);
  }
  return blobs;
}

// Helper function to convert stream to string
async function streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}
