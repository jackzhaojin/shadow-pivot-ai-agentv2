# Deployment Guide

This document outlines the deployment process for the TSLA AI UI Agent.

## Docker Containerization

Build and test locally:

```bash
docker build -t shadow-pivot-ai-agentv2 .
docker run -p 3000:3000 shadow-pivot-ai-agentv2
```

## GitHub Actions CI/CD

Automated deployment pipeline:

*   **Trigger**: Push to `main` branch
*   **Registry**: GitHub Container Registry (GHCR)
*   **Target**: Azure App Service with container support
*   **Authentication**: OIDC with Azure

## Testing & Validation

### Must Pass Before Deployment

1.  **Local Azure connections working**:
    ```bash
    curl http://localhost:3000/api/test-storage
    curl http://localhost:3000/api/test-ai
    ```

2.  **Interactive tests passing**: Visit `/test-azure` and verify all connections

3.  **Azure CLI authenticated**: `az account show` returns your subscription

4.  **Docker build successful**: Container runs without errors
