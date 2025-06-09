import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export function getBlobServiceClient() {
  const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'shadowpivotaiagentstrg';
  const credential = new DefaultAzureCredential();
  
  return new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    credential
  );
}

export function getExecutionsContainer() {
  const blobServiceClient = getBlobServiceClient();
  return blobServiceClient.getContainerClient('executions');
}
