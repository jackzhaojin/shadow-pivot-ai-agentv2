# Infrastructure Setup Guide for TSLA AI UI Agent

This guide outlines the **manual setup steps** required to provision cloud infrastructure for the MVP of the TSLA AI UI Agent. Infrastructure as Code (IaC) will be added post-MVP.

## 🚀 Quick Start for Web App Deployment

**Prerequisites**: You have Docker and GitHub Actions already set up (see project-management.mdc).

### Essential Steps (30-45 minutes):

1. **Create Azure Resource Group** → `ShadowPivot`
2. **Create Azure Web App** → `shadow-pivot-ai-agentv2` (container-enabled)
3. **Configure Container Registry** → Point to `ghcr.io/[username]/shadow-pivot-ai-agentv2:latest`
4. **Set up GitHub Personal Access Token** → For container registry access
5. **Configure GitHub OIDC** → Enable automated deployments
6. **Push to main branch** → Trigger automatic deployment

**Result**: Your Next.js app will be live at `https://shadow-pivot-ai-agentv2.azurewebsites.net`

*Detailed instructions for each step are provided in the sections below.*

---

## 📦 Azure Resources

### 1. Create a Resource Group

A Resource Group is a logical container that holds related resources.

**Steps:**

1. Log in to [Azure Portal](https://portal.azure.com).
2. In the search bar, type **"Resource Groups"** and click the result.
3. Click **"+ Create"**.
4. Choose your **Subscription**.
5. Set the **Resource Group Name** to `ShadowPivot`.
6. Choose a **Region** close to your location (e.g., East US).
7. Click **"Review + Create"**, then click **"Create"**.

### 2. Create Azure Blob Storage (Hot Tier)

We use this for storing per-user data and execution output.

**Steps:**

1. In the Azure Portal, search for **"Storage Accounts"** and click **"+ Create"**.
2. Choose the `ShadowPivot` resource group.
3. Set a **Storage Account Name** (e.g., `shadowpivotstorage`).
4. Select the **Region** to match your Resource Group.
5. Set **Performance** to **Standard**, and **Redundancy** to **Locally-redundant storage (LRS)**.
6. Click **"Review + Create"**, then click **"Create"**.
7. Once created, go into the storage account.
8. In the left menu, go to **Containers**, then click **"+ Container"**.
9. Name it `executions` and set **Public Access Level** to **Private (no anonymous access)**.

### 3. Provision Azure AI Foundry

We use this for connecting to Azure's hosted LLMs via inference APIs.

**Steps:**

1. In Azure Portal, go to **"AI + Machine Learning" > "Azure AI Studio"**.
2. Create a new **Project** and **Deployment**.
3. Select a model (e.g., GPT-4 or Foundry-based model).
4. Choose the same **Region** as the Storage Account.
5. Once deployed, note the **Endpoint URL** and **Resource Name** for configuration.

### 4. Enable Managed Identity for Web App

This allows secure identity-based access to other Azure services without credentials.

**Steps:**

1. Go to your Web App or Container App in Azure.
2. In the left menu, click **Identity**.
3. Under **System Assigned**, click **"On"** and **Save**.
4. Go to **Access Control (IAM)** on the Storage Account.
5. Click **"Add role assignment"**.
6. Role: `Storage Blob Data Contributor`
7. Assign to: the Managed Identity of your Web App

> (Optional) Repeat for Azure AI Foundry access if RBAC-based.

### 5. Deploy Azure Web App for Container

This will host your Next.js app using the Docker image from GitHub Container Registry.

**Important**: This project is configured to use GitHub Container Registry (GHCR) with automated Docker builds via GitHub Actions.

#### 5.1 Create the Web App

**Steps:**

1. From Azure Portal, search **"App Services"** and click **"+ Create"**.
2. Select the `ShadowPivot` Resource Group.
3. **Name your app**: `shadow-pivot-ai-agentv2` (must match the GitHub Actions workflow)
4. **Publish**: Choose **"Container"**
5. **Operating System**: Choose **"Linux"**
6. **Region**: Choose the same region as your Resource Group
7. **Linux Plan**: Create new or select existing (Basic B1 or higher recommended)
8. Click **"Next: Container"**

#### 5.2 Configure Container Settings

**Important**: These settings connect your Web App to the GitHub Container Registry image.

**Container Settings:**

1. **Image Source**: Choose **"Other container registries"**
2. **Access Type**: Choose **"Public"**
3. **Registry server URL**: `https://ghcr.io` (include the https:// prefix)
4. **Image and tag**: `[YOUR-GITHUB-USERNAME]/shadow-pivot-ai-agentv2:latest`
   - Replace `[YOUR-GITHUB-USERNAME]` with your actual GitHub username
   - Example: `jackzhaojin/shadow-pivot-ai-agentv2:latest`
   - Note: Do NOT include `ghcr.io/` prefix here - just the image path
5. **Registry username**: Your GitHub username
6. **Registry password**: Create a GitHub Personal Access Token (PAT) with `packages:read` permission
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Create a classic token with `read:packages` scope
   - Use this token as the registry password

**Startup Command**: Leave empty (the Dockerfile handles this)

#### 5.3 Configure Environment Variables

**Steps:**

1. After creating the Web App, go to **Configuration** → **Application settings**
2. Add the following environment variables:

   **Required:**
   - `WEBSITES_PORT`: `3000` (Next.js default port)
   - `AZURE_STORAGE_ACCOUNT`: `<your storage account name>`
   
   **Optional (add when AI services are configured):**
   - `AI_ENDPOINT`: `<your AI Foundry endpoint>`
   - `MCP_SERVER_URL`: `<your MCP endpoint>`

3. Click **"Save"**

#### 5.4 Enable Continuous Deployment

**Option A: GitHub Actions (Recommended)**

Your project already has a GitHub Actions workflow that:
1. Builds the Docker image automatically on every push to `main`
2. Pushes the image to GitHub Container Registry
3. Restarts your Azure Web App to pull the latest image

**Setup Steps:**
1. Configure the GitHub repository variables (see OIDC section below)
2. Push your code to the `main` branch
3. The GitHub Actions workflow will automatically deploy

**Option B: Manual Deployment**

If GitHub Actions isn't set up yet:
1. Go to **Deployment Center** in your Web App
2. Choose **"Container Registry"**
3. Select **"GitHub Container Registry"**
4. Configure authentication using GitHub PAT
5. Set up webhook for automatic deployments

#### 5.5 Verify Deployment

**Steps:**

1. Go to your Web App **Overview** page
2. Click the **URL** to open your application
3. You should see the Next.js default page
4. Check **Log stream** for any startup errors
5. Monitor **Metrics** for performance

**Common Issues:**

- **403 Forbidden**: Check GitHub PAT permissions and registry settings
- **Container startup errors**: Check **Log stream** for detailed error messages
- **Port issues**: Ensure `WEBSITES_PORT=3000` is set correctly
- **Image pull errors**: Verify the image name exactly matches your GitHub username/repository

#### 5.6 Configure Custom Domain (Optional)

**Steps:**

1. Go to **Custom domains** in your Web App
2. Add your domain name
3. Configure DNS settings with your domain provider
4. Enable **HTTPS Only** for security

**Important Notes:**

- The Web App name `shadow-pivot-ai-agentv2` must match the `WEBAPP_NAME` in your GitHub Actions workflow
- The container image will be automatically updated when you push to the `main` branch
- Initial container pull may take 2-3 minutes
- The Web App will automatically restart when a new image version is available

---

## 🐳 GitHub Container Registry (GHCR) Integration

This project uses GitHub Container Registry for container image storage and automated deployments.

### How It Works

1. **Code Push**: When you push code to the `main` branch
2. **GitHub Actions**: Automatically builds Docker image using your `Dockerfile`
3. **Image Push**: Pushes the built image to `ghcr.io/[username]/shadow-pivot-ai-agentv2:latest`
4. **Azure Deployment**: Restarts Azure Web App to pull the latest image

### GitHub Personal Access Token Setup

**For Azure Web App to access GHCR:**

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Click **"Generate new token (classic)"**
3. **Note**: Give it a descriptive name like `Azure-GHCR-Access`
4. **Expiration**: Set to 90 days or longer
5. **Scopes**: Select `read:packages`
6. Click **"Generate token"**
7. **Important**: Copy the token immediately (you won't see it again)
8. Use this token as the **registry password** in Azure Web App container settings

### Image Naming Convention

Your GitHub Actions workflow is configured to use:
- **Registry**: `ghcr.io`
- **Full Image Name**: `ghcr.io/[YOUR-USERNAME]/shadow-pivot-ai-agentv2`
- **Tag**: `latest`

**Important**: In Azure Web App configuration:
- **Registry server URL**: `https://ghcr.io` (with https://)
- **Image and tag field**: `[YOUR-USERNAME]/shadow-pivot-ai-agentv2:latest` (without ghcr.io/ prefix)

**Example**: If your GitHub username is `jackzhaojin`:
- **GitHub Actions pushes to**: `ghcr.io/jackzhaojin/shadow-pivot-ai-agentv2:latest`
- **Azure Registry server URL**: `https://ghcr.io`
- **Azure Image and tag**: `jackzhaojin/shadow-pivot-ai-agentv2:latest`

### Troubleshooting GHCR Issues

**Common Problems:**

- **"unauthorized: unauthenticated"**: 
  - Check GitHub PAT has `read:packages` permission
  - Verify PAT hasn't expired
  - Ensure registry password in Azure matches your GitHub PAT

- **"manifest unknown"**: 
  - GitHub Actions hasn't run yet or failed
  - Check GitHub Actions logs for build failures
  - Verify the image was successfully pushed to GHCR

- **"pull access denied"**:
  - Repository might be private and GHCR permissions need adjustment
  - Check GitHub package visibility settings

**Verification Steps:**

1. Go to your GitHub repository → **Packages** tab
2. You should see `shadow-pivot-ai-agentv2` package after first successful build
3. Click on the package to see available versions and tags

---

## 🔐 Identity & Access

### For Local Development

Use the Azure CLI and SDK’s `DefaultAzureCredential`.

**Steps:**

1. Install Azure CLI: [https://learn.microsoft.com/en-us/cli/azure/install-azure-cli](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
2. Run: `az login`
3. Ensure your Azure user has `Storage Blob Data Contributor` on the storage account.
4. Use `DefaultAzureCredential` in your app’s server code.

### For Production

* Your Web App will use **Managed Identity** as described above.
* Ensure role assignments are set for blob and AI access.

### For GitHub Actions (Required for Automated Deployment - OIDC Authentication)

**Enable passwordless authentication for GitHub Actions to restart Azure App Service**

This setup is **required** for the automated deployment pipeline. It allows GitHub Actions to authenticate with Azure without storing sensitive credentials, using OpenID Connect (OIDC) for secure, token-based authentication.

#### 1. Create Azure Enterprise Application

**Steps:**

1. Log in to [Azure Portal](https://portal.azure.com).
2. Go to **Azure Active Directory** > **Enterprise Applications**.
3. Click **"+ New Application"** > **"Create your own application"**.
4. Name it `GitHub-Actions-OIDC` and select **"Register an application to integrate with Azure AD"**.
5. Click **"Create"**.
6. Once created, go to **App Registrations** and find your newly created app.
7. Note down the **Application (client) ID** - this is your `AZURE_CLIENT_ID`.
8. Note down the **Directory (tenant) ID** - this is your `AZURE_TENANT_ID`.

#### 2. Configure Federated Credentials

**Steps:**

1. In your App Registration, go to **Certificates & secrets**.
2. Click **"Federated credentials"** tab.
3. Click **"+ Add credential"**.
4. Select **"GitHub Actions deploying Azure resources"**.
5. Fill in the form:
   - **Organization**: Your GitHub username/organization
   - **Repository**: `shadow-pivot-ai-agentv2`
   - **Entity type**: `Branch`
   - **GitHub branch name**: `main`
   - **Name**: `main-branch-deployment`
6. Click **"Add"**.

> **Note**: This allows only the `main` branch to authenticate with Azure. For additional branches, create separate federated credentials.

#### 3. Assign Azure Permissions to Enterprise Application

**Steps:**

1. Go to your **Subscription** in Azure Portal.
2. Click **"Access control (IAM)"**.
3. Click **"+ Add"** > **"Add role assignment"**.
4. Select **"Contributor"** role (or create a custom role with just restart permissions).
5. In **"Assign access to"**, select **"User, group, or service principal"**.
6. Search for your Enterprise Application name (`GitHub-Actions-OIDC`).
7. Select it and click **"Save"**.

Alternatively, for minimal permissions, assign these specific roles:
- **Website Contributor** (on the App Service)
- **Reader** (on the Resource Group)

#### 4. Configure GitHub Repository Variables

**Steps:**

1. Go to your GitHub repository.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Click **"Variables"** tab.
4. Add these repository variables:
   - `AZURE_CLIENT_ID`: Application (client) ID from step 1
   - `AZURE_TENANT_ID`: Directory (tenant) ID from step 1
   - `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID

#### 5. Verify OIDC Configuration

Your GitHub Actions workflow (`.github/workflows/main_shadow-pivot-ai-agentv2.yml`) is already configured to use these variables:

```yaml
- name: Login to Azure
  uses: azure/login@v2
  with:
    client-id: ${{ vars.AZURE_CLIENT_ID }}
    tenant-id: ${{ vars.AZURE_TENANT_ID }}
    subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
```

#### 6. Test the Setup

**Steps:**

1. Push a commit to your `main` branch.
2. Watch the GitHub Actions workflow run.
3. Verify that the Azure login step succeeds.
4. Check that the App Service restart completes without errors.

#### Troubleshooting

**Common Issues:**

- **Authentication failed**: Verify federated credential is configured for the correct repository and branch
- **Insufficient permissions**: Ensure the Enterprise Application has appropriate Azure RBAC roles
- **Wrong tenant**: Double-check `AZURE_TENANT_ID` matches your Azure AD tenant
- **Branch mismatch**: Federated credential must match the exact branch name triggering the workflow

---

## 🔧 Troubleshooting Web App Deployment

### Common Issues and Solutions

#### Web App Not Starting
**Symptoms**: Web App shows "Application Error" or stays in "Starting" state

**Solutions**:
1. Check **Log Stream** in Azure Portal for detailed error messages
2. Verify `WEBSITES_PORT=3000` is set in Configuration → Application settings
3. Ensure Docker image was built successfully (check GitHub Actions logs)
4. Verify container registry credentials are correct

#### Container Pull Failures
**Symptoms**: "Failed to pull image" in logs

**Solutions**:
1. Check GitHub Personal Access Token hasn't expired
2. Verify image path exactly matches: `ghcr.io/[username]/shadow-pivot-ai-agentv2:latest`
3. Ensure GitHub repository and packages are accessible
4. Check if image exists in GitHub Packages tab

#### GitHub Actions Authentication Errors
**Symptoms**: Azure login step fails in GitHub Actions

**Solutions**:
1. Verify all three GitHub repository variables are set correctly:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID` 
   - `AZURE_SUBSCRIPTION_ID`
2. Check federated credential is configured for exact repository name and `main` branch
3. Ensure Enterprise Application has sufficient permissions (Website Contributor minimum)

#### Application Loads But Can't Connect to Azure Services
**Symptoms**: App loads but Azure Storage/AI services fail

**Solutions**:
1. Verify Managed Identity is enabled on Web App
2. Check RBAC role assignments (Storage Blob Data Contributor)
3. Ensure environment variables are set correctly
4. Test Azure CLI access: `az login && az storage blob list` (locally first)

### Deployment Validation Steps

**After Web App Creation**:
1. **Test Container Pull**: Check Deployment Center → Logs for successful image pull
2. **Test Application Start**: Monitor Log Stream for Next.js startup messages  
3. **Test Public Access**: Open Web App URL and verify Next.js default page loads
4. **Test GitHub Actions**: Push a small change and verify automated deployment

**Logs to Monitor**:
- **Azure Web App Log Stream**: Real-time application logs
- **GitHub Actions Logs**: Build and deployment process logs
- **Azure Activity Log**: Resource-level operations and errors

### Performance Optimization

**Recommended Settings for Production**:
- **App Service Plan**: Standard S1 or higher for production workloads
- **Always On**: Enable to prevent cold starts
- **Health Check**: Configure health check endpoint for reliability
- **Application Insights**: Enable for monitoring and diagnostics

---

## 📂 Directory Structure for Blob Storage

This is the format for persisted executions:

```
shadowpivotstorage/
└── executions/
    └── <user-guid>/
        └── <execution-id>/
            ├── figma-spec.json
            ├── code-bundle.zip
            ├── trace-log.json
            └── metadata.json
```

---

## 📝 Notes

* Add **CORS settings** to the storage account if your app runs in-browser and needs blob access.
* Ensure Next.js SSR/CSR rendering is compatible with Azure runtime ports.
* Set app secrets like storage keys or endpoints in App Settings or `.env.local`.

---

## ✅ Checklist for MVP

### Core Infrastructure
* [ ] Create or confirm `ShadowPivot` resource group
* [ ] Create Azure Storage Account (Hot V2 tier)
* [ ] Create `executions` container inside storage
* [ ] Deploy Azure AI Foundry endpoint
* [ ] **Create Azure Web App for Container**
  * [ ] Set up Web App with Linux/Container configuration
  * [ ] Configure container registry connection to GHCR
  * [ ] Set image path: `ghcr.io/[username]/shadow-pivot-ai-agentv2:latest`
  * [ ] Create GitHub Personal Access Token for registry access
  * [ ] Configure environment variables (`WEBSITES_PORT=3000`, `AZURE_STORAGE_ACCOUNT`)
* [ ] Enable Managed Identity on Web App
* [ ] Assign correct RBAC roles (Storage Blob Data Contributor)
* [ ] Verify local auth using `az login` + SDK
* [ ] **Test automated deployment pipeline**
  * [ ] Push code to main branch
  * [ ] Verify GitHub Actions builds and pushes image
  * [ ] Confirm Azure Web App pulls and restarts with new image
  * [ ] Validate deployed app is accessible via public URL

### GitHub Actions OIDC (Required for Automated Deployment)
* [ ] Create Azure Enterprise Application for GitHub Actions
* [ ] Configure federated credentials for `main` branch
* [ ] Assign Azure permissions to Enterprise Application (Contributor or Website Contributor)
* [ ] Set up GitHub repository variables:
  * [ ] `AZURE_CLIENT_ID`: Application (client) ID
  * [ ] `AZURE_TENANT_ID`: Directory (tenant) ID  
  * [ ] `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID
* [ ] **Test passwordless authentication workflow**
  * [ ] Push commit to main branch
  * [ ] Verify GitHub Actions can login to Azure
  * [ ] Confirm Web App restart completes successfully

### Container Registry & Deployment Validation
* [ ] **Verify GitHub Container Registry (GHCR) integration**
  * [ ] Check that GitHub Actions pushes images successfully
  * [ ] Verify image is visible in GitHub Packages
  * [ ] Confirm Azure Web App can pull from GHCR
* [ ] **Test end-to-end deployment flow**
  * [ ] Make a code change and push to main
  * [ ] Monitor GitHub Actions workflow completion
  * [ ] Verify Azure Web App shows new deployment
  * [ ] Test that application loads correctly

---

## 🔜 Future (IaC Roadmap)

* Terraform/Bicep scripts to manage all resources
* GitHub Actions workflows for CI/CD deployment
* Auto-rotate credentials and SAS tokens for secure access
