# Troubleshooting Guide

This guide provides solutions to common issues encountered during development and deployment.

## Common Issues

**"DefaultAzureCredential failed"**:
- Run `az login` and verify authentication.
- Check `az account show` displays correct subscription.

**"Storage account not found"**:
- Verify storage account name in environment variables.
- Check RBAC permissions in Azure Portal.

**"Insufficient permissions"**:
- Ensure proper role assignments:
  - Storage Blob Data Contributor (Storage Account)
  - Cognitive Services User (AI Services)

## Debug Commands

```bash
# Check Azure authentication
az account show

# Test storage access via CLI
az storage blob list --account-name shadowpivotaiagentstrg --container-name executions --auth-mode login

# View container logs (if deployed)
az webapp log tail --name shadow-pivot-ai-agentv2 --resource-group ShadowPivot
```
