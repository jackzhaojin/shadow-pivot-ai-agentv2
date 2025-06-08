# Infrastructure Setup Guide for TSLA AI UI Agent

This guide outlines the **manual setup steps** required to provision cloud infrastructure for the MVP of the TSLA AI UI Agent. Infrastructure as Code (IaC) will be added post-MVP.

## 🚀 Quick Start for Web App Deployment

**Prerequisites**: You have Docker and GitHub Actions already set up (see project-management.mdc).

### Essential Steps (30-45 minutes):

1. **Create Azure Resource Group** → `ShadowPivot`
2. **Create Azure Web App** → `shadow-pivot-ai-agentv2` (container-enabled)
3### For Local Development

Use the Azure CLI and SDK's `DefaultAzureCredential` for seamless local development.

**Detailed Setup Steps:**

#### 1. Install Azure CLI

**Windows (using PowerShell or Command Prompt):**
```bash
# Option 1: Using winget (Windows Package Manager)
winget install -e --id Microsoft.AzureCLI

# Option 2: Download MSI installer
# Go to: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows
```

**macOS:**
```bash
# Using Homebrew
brew install azure-cli
```

**Linux (Ubuntu/Debian):**
```bash
# Download and install
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

#### 2. Login to Azure

1. **Authenticate with Azure**:
   ```bash
   az login
   ```
   - This opens your web browser for authentication
   - Sign in with your Azure account credentials
   - The CLI will automatically configure access

2. **Set Default Subscription** (if you have multiple):
   ```bash
   # List all subscriptions
   az account list --output table
   
   # Set the correct subscription
   az account set --subscription "[Your Subscription Name or ID]"
   ```

3. **Verify Access**:
   ```bash
   # Test storage access
   az storage account list --resource-group ShadowPivot --output table
   
   # Test blob access (replace with your storage account name)
   az storage blob list --account-name shadowpivotstorage2025 --container-name executions --auth-mode login
   ```

#### 3. Configure Local Environment Variables

Create a `.env.local` file in your project root for local development:

```bash
# Storage Configuration (for local development)
AZURE_STORAGE_ACCOUNT_NAME=shadowpivotstorage2025

# AI Services Configuration (add when ready)
AZURE_OPENAI_ENDPOINT=https://shadow-pivot-ai-services.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-deployment

# Development Environment
NODE_ENV=development
```

**Important**: 
- `.env.local` is already in your `.gitignore` - never commit it
- In production, these come from Azure Web App environment variables
- `DefaultAzureCredential` automatically uses your `az login` session

#### 4. Test Local Azure Integration

**Create a test script** (`test-azure.js`):

```javascript
const { DefaultAzureCredential } = require('@azure/identity');
const { BlobServiceClient } = require('@azure/storage-blob');

async function testAzureConnection() {
  try {
    const credential = new DefaultAzureCredential();
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );
    
    const containerClient = blobServiceClient.getContainerClient('executions');
    console.log('✅ Successfully connected to Azure Storage');
    
    // List containers to verify access
    const containers = blobServiceClient.listContainers();
    for await (const container of containers) {
      console.log(`📁 Container: ${container.name}`);
    }
  } catch (error) {
    console.error('❌ Azure connection failed:', error.message);
  }
}

testAzureConnection();
```

**Run the test**:
```bash
npm install @azure/storage-blob @azure/identity
node test-azure.js
```

#### 5. Required Role Assignments for Local Development

Ensure your Azure user account has the necessary permissions:

1. **For Storage Account**:
   - Go to Storage Account → **Access Control (IAM)**
   - Add role assignment: **"Storage Blob Data Contributor"**
   - Assign to: Your Azure user account

2. **For AI Services**:
   - Go to AI Services → **Access Control (IAM)**
   - Add role assignment: **"Cognitive Services OpenAI User"**
   - Assign to: Your Azure user account

**🔍 Troubleshooting Local Development:**

- **"DefaultAzureCredential failed"**: Run `az login` again and verify subscription
- **"Insufficient permissions"**: Check RBAC role assignments for your user account
- **"Storage account not found"**: Verify storage account name in environment variables
- **"Authentication timeout"**: Try `az account clear` then `az login` again

**💡 Best Practices for Local Development:**
- Always use `DefaultAzureCredential` in your code (works both locally and in Azure)
- Keep sensitive values in `.env.local` (never commit)
- Test Azure connections locally before deploying
- Use the same environment variable names locally and in productionure Container Registry** → Point to `ghcr.io/[username]/shadow-pivot-ai-agentv2:latest`
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

**Detailed Steps:**

#### 2.1 Create Storage Account

1. **Navigate to Storage Accounts**:
   - In the Azure Portal, click the search bar at the top
   - Type **"Storage Accounts"** and press Enter
   - Click **"Storage accounts"** from the results
   - Click the **"+ Create"** button (blue button at top-left)

2. **Configure Basic Settings**:
   - **Subscription**: Select your Azure subscription (usually pre-selected)
   - **Resource Group**: Click dropdown and select **"ShadowPivot"** (created in step 1)
   - **Storage Account Name**: Enter **"shadowpivotaiagentstrg"** 
     - If name is taken, try adding your initials or random numbers
   - **Region**: Choose **the same region** as your Resource Group (e.g., "East US")
   - **Performance**: Select **"Standard"** (default)
   - **Redundancy**: Select **"Locally-redundant storage (LRS)"** (most cost-effective)

3. **Configure Advanced Settings**:
   - Click **"Next: Advanced"**
   - **Require secure transfer for REST API operations**: Leave **checked** (default)
   - **Allow enabling public access on containers**: Leave **checked** (we'll disable public access per container)
   - **Minimum TLS version**: Leave as **"Version 1.2"** (default)
   - **Access tier**: Select **"Hot"** (for frequently accessed data)
   - All other settings can remain default

4. **Skip Networking, Data Protection, Encryption (defaults are fine)**:
   - Click **"Next: Networking"** → **"Next: Data protection"** → **"Next: Encryption"**
   - Keep all defaults for MVP

5. **Create the Storage Account**:
   - Click **"Review + Create"**
   - Review settings and click **"Create"**
   - Wait 1-2 minutes for deployment to complete
   - Click **"Go to resource"** when deployment finishes

#### 2.2 Create Blob Container

1. **Navigate to Containers**:
   - In your Storage Account, look at the left sidebar
   - Under **"Data storage"**, click **"Containers"**
   - Click **"+ Container"** (blue button at top)

2. **Configure Container**:
   - **Name**: Enter **"executions"** (exactly this name - the app expects it)
   - **Anonymous access level**: Select **"Private (no anonymous access)"** (default)
   - Click **"Create"**

3. **Verify Container Creation**:
   - You should see the "executions" container listed
   - Status should show as "Available"

#### 2.3 Note Storage Account Details

**Important**: Save these details for later configuration:

1. **Storage Account Name**: Copy the name you created (e.g., `shadowpivotaiagentstorage2025`)
2. **Storage Account Access Keys**:
   - In the left sidebar, click **"Access keys"** under "Security + networking"
   - Under "key1", click **"Show"** next to "Key"
   - Copy the **Connection string** (you'll need this for environment variables)

**💡 Save These Values:**
- Storage Account Name: `[your storage account name]`
- Connection String: `DefaultEndpointsProtocol=https;AccountName=...` (full string)

### 3. Provision Azure AI Foundry

We use this for connecting to Azure's hosted LLMs via inference APIs.

**Important Note**: Azure AI Foundry might have different availability and naming in different regions. These instructions cover the most common setup path.

**Detailed Steps:**

#### 3.1 Create Azure AI Hub (Required for AI Foundry)

1. **Navigate to Azure AI Services**:
   - In Azure Portal search bar, type **"Azure AI Studio"** or **"Azure AI services"**
   - Click **"Azure AI Studio"** from the results
   - If this is your first time, you may see a welcome page - click **"Get started"**

2. **Create AI Hub**:
   - Click **"Create"** or **"+ New hub"**
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Select **"ShadowPivot"**
   - **Hub name**: Enter **"shadow-pivot-ai-hub"**
   - **Region**: Choose **the same region** as your other resources (e.g., "East US")
   - **Connect Azure AI services**: Choose **"Create new AI services"**
   - **Connect Azure AI Search**: Choose **"Skip connecting"** (not needed for MVP)

3. **Configure AI Services**:
   - **AI services name**: Enter **"shadow-pivot-ai-services"**
   - **Pricing tier**: Select **"Standard S0"** (pay-per-use)
   - Click **"Review + Create"**
   - Wait for deployment (can take 3-5 minutes)

#### 3.2 Create AI Project

1. **Access AI Studio**:
   - After hub creation, go to [Azure AI Studio](https://ai.azure.com)
   - Click **"Sign in"** and use your Azure credentials
   - Select your subscription and newly created hub

2. **Create Project**:
   - Click **"+ New project"**
   - **Project name**: Enter **"shadow-pivot-ai-project"**
   - **Hub**: Select your created hub (**"shadow-pivot-ai-hub"**)
   - Click **"Create project"**

#### 3.3 Deploy AI Models

1. **Navigate to Deployments**:
   - In AI Studio, go to **"Deployments"** in the left sidebar
   - Click **"+ Create deployment"**

2. **Deploy GPT Model**:
   - **Model**: Search for and select **"gpt-35-turbo"** or **"gpt-4"** (depending on availability)
   - **Deployment name**: Enter **"gpt-deployment"**
   - **Version**: Select latest available version
   - **Deployment type**: Choose **"Standard"**
   - **Tokens per minute rate limit**: Start with **"30K"** (adjust based on usage)
   - Click **"Deploy"**
   - Wait for deployment (1-2 minutes)

#### 3.4 Get Endpoint Information

1. **Find Deployment Details**:
   - Go to **"Deployments"** in AI Studio
   - Click on your deployment (**"gpt-deployment"**)
   - Copy the **"Target URI"** (this is your endpoint URL)

2. **Get API Keys**:
   - In Azure Portal, search for your AI services resource (**"shadow-pivot-ai-services"**)
   - Go to **"Keys and Endpoint"** in the left sidebar
   - Copy **"KEY 1"** (you'll need this for authentication)

**💡 Save These Values:**
- AI Endpoint URL: `https://[your-resource].openai.azure.com/`
- API Key: `[your API key]`
- Deployment Name: `gpt-deployment` (or whatever you named it)

#### 3.5 Alternative: Use Azure OpenAI Service Directly

If Azure AI Studio isn't available in your region:

1. **Create Azure OpenAI Resource**:
   - Search for **"Azure OpenAI"** in Azure Portal
   - Click **"+ Create"**
   - **Resource Group**: Select **"ShadowPivot"**
   - **Region**: Choose a region with OpenAI availability (e.g., East US, West Europe)
   - **Name**: Enter **"shadow-pivot-openai"**
   - **Pricing tier**: Select **"Standard S0"**
   - Click **"Review + Create"**

2. **Deploy Model via Azure OpenAI Studio**:
   - After creation, click **"Go to Azure OpenAI Studio"**
   - Follow similar deployment steps as above

**📋 Troubleshooting AI Services:**

- **"No models available"**: Some regions have limited model availability. Try East US or West Europe.
- **"Quota exceeded"**: Request quota increase in Azure Portal under your AI services resource.
- **"Access denied"**: Ensure your Azure account has appropriate permissions (Contributor on resource group).

### 4. Enable Managed Identity for Web App

This allows secure identity-based access to other Azure services without storing credentials in your application.

**Important**: Complete this step **after** creating your Web App (step 5).

**Detailed Steps:**

#### 4.1 Enable System-Assigned Managed Identity

1. **Navigate to Your Web App**:
   - In Azure Portal, search for **"App Services"**
   - Click on your Web App (**"shadow-pivot-ai-agentv2"**)

2. **Enable Managed Identity**:
   - In the left sidebar, scroll down to **"Settings"**
   - Click **"Identity"**
   - Under **"System assigned"** tab:
     - Change **Status** from "Off" to **"On"**
     - Click **"Save"**
     - Click **"Yes"** on the confirmation dialog
   - **Important**: Copy the **Object (principal) ID** that appears - you'll need this for role assignments

#### 4.2 Assign Storage Permissions

1. **Navigate to Storage Account**:
   - Go to Azure Portal home
   - Search for your storage account name (e.g., `shadowpivotaiagentstorage2025`)
   - Click on your storage account

2. **Add Role Assignment**:
   - In the left sidebar, click **"Access Control (IAM)"**
   - Click **"+ Add"** → **"Add role assignment"**

3. **Configure Role Assignment**:
   - **Role tab**:
     - Search for **"Storage Blob Data Contributor"**
     - Select it and click **"Next"**
   - **Members tab**:
     - **Assign access to**: Select **"Managed identity"**
     - Click **"+ Select members"**
     - **Managed identity**: Select **"App Service"** from dropdown
     - **Subscription**: Your subscription should be pre-selected
     - Select your Web App (**"shadow-pivot-ai-agentv2"**)
     - Click **"Select"**
   - **Review + assign tab**:
     - Click **"Review + assign"**
     - Click **"Review + assign"** again to confirm

4. **Verify Assignment**:
   - Still in Storage Account IAM, click **"Role assignments"** tab
   - Search for your Web App name
   - You should see "Storage Blob Data Contributor" role assigned

#### 4.3 Assign AI Services Permissions (If Using Azure AI)

1. **Navigate to AI Services Resource**:
   - Search for your AI services resource (**"shadow-pivot-ai-services"**)
   - Click on the resource

2. **Add Role Assignment**:
   - Click **"Access Control (IAM)"** in left sidebar
   - Click **"+ Add"** → **"Add role assignment"**

3. **Configure AI Role Assignment**:
   - **Role tab**:
     - Search for **"Cognitive Services OpenAI User"** or **"Cognitive Services User"**
     - Select it and click **"Next"**
   - **Members tab**:
     - **Assign access to**: Select **"Managed identity"**
     - Click **"+ Select members"**
     - **Managed identity**: Select **"App Service"**
     - Select your Web App (**"shadow-pivot-ai-agentv2"**)
     - Click **"Select"**
   - Click **"Review + assign"** twice

#### 4.4 Verify Managed Identity Setup

**Check Identity Status**:
1. Go back to your Web App → **"Identity"**
2. **System assigned** should show **Status: On**
3. **Object (principal) ID** should be populated

**Check Permissions**:
1. Storage Account → **"Access Control (IAM)"** → **"Role assignments"**
2. AI Services → **"Access Control (IAM)"** → **"Role assignments"**
3. Both should show your Web App with appropriate roles

**🔍 Troubleshooting Managed Identity:**

- **"Principal not found"**: Wait 5-10 minutes after enabling managed identity before assigning roles
- **"Insufficient permissions"**: Ensure you have "Owner" or "User Access Administrator" role on the subscription
- **"Assignment failed"**: Try refreshing the page and attempting the role assignment again

**📋 What Managed Identity Enables:**
- Your Web App can access Azure Storage without connection strings
- Your Web App can call AI services without API keys
- Automatic credential rotation and enhanced security
- No secrets stored in application configuration

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

1. **Navigate to Configuration**:
   - In your Web App, go to the left sidebar
   - Under **"Settings"**, click **"Configuration"**
   - Click **"Application settings"** tab

2. **Add Required Environment Variables**:

   **Essential for Next.js Container:**
   - Click **"+ New application setting"**
   - **Name**: `WEBSITES_PORT`
   - **Value**: `3000`
   - Click **"OK"**

   **For Azure Storage (Required):**
   - Click **"+ New application setting"**
   - **Name**: `AZURE_STORAGE_ACCOUNT_NAME`
   - **Value**: `[your storage account name]` (e.g., `shadowpivotstorage2025`)
   - Click **"OK"**

   **For Production Mode:**
   - Click **"+ New application setting"**
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - Click **"OK"**

3. **Add Optional Environment Variables** (add these when you're ready to integrate AI services):

   **For Azure AI Services:**
   - **Name**: `AZURE_OPENAI_ENDPOINT`
   - **Value**: `[your AI endpoint URL]` (e.g., `https://shadow-pivot-ai-services.openai.azure.com/`)
   
   - **Name**: `AZURE_OPENAI_DEPLOYMENT_NAME`
   - **Value**: `gpt-deployment` (or your deployment name)

   **For MCP Server (Future):**
   - **Name**: `MCP_SERVER_URL`
   - **Value**: `[your MCP endpoint]` (add later when MCP is configured)

4. **Save Configuration**:
   - Click **"Save"** at the top of the page
   - Click **"Continue"** on the warning dialog (this will restart your app)
   - Wait for the restart to complete (30-60 seconds)

**🔧 Environment Variables Reference:**

| Variable Name | Required | Purpose | Example Value |
|--------------|----------|---------|---------------|
| `WEBSITES_PORT` | ✅ Yes | Port for Next.js app | `3000` |
| `NODE_ENV` | ✅ Yes | Node.js environment | `production` |
| `AZURE_STORAGE_ACCOUNT_NAME` | ✅ Yes | Storage account name | `shadowpivotstorage2025` |
| `AZURE_OPENAI_ENDPOINT` | 🔄 Later | AI services endpoint | `https://....openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | 🔄 Later | AI model deployment | `gpt-deployment` |
| `MCP_SERVER_URL` | 🔄 Future | MCP integration | `https://...` |

**📋 Important Notes:**
- **Do NOT add** connection strings or API keys as environment variables when using Managed Identity
- Managed Identity handles authentication automatically
- Environment variables are encrypted at rest in Azure
- Changes to environment variables restart your application automatically

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

## ✅ Complete Setup Checklist

### Phase 1: Core Infrastructure Setup (30-45 minutes)

#### 1.1 Azure Resource Group
- [ ] **Create Resource Group**
  - [ ] Log in to [Azure Portal](https://portal.azure.com)
  - [ ] Search for "Resource Groups" → Click "+ Create"
  - [ ] Name: `ShadowPivot`
  - [ ] Region: Choose your preferred region (e.g., "East US")
  - [ ] Click "Review + Create" → "Create"

#### 1.2 Azure Storage Account
- [ ] **Create Storage Account**
  - [ ] Search "Storage accounts" → Click "+ Create"
  - [ ] Resource Group: `ShadowPivot`
  - [ ] Name: `shadowpivotstorage[unique]` (e.g., `shadowpivotstorage2025`)
  - [ ] Region: Same as Resource Group
  - [ ] Performance: Standard, Redundancy: LRS, Access tier: Hot
  - [ ] Create account (wait 1-2 minutes)
- [ ] **Create Blob Container**
  - [ ] Go to Storage Account → Containers → "+ Container"
  - [ ] Name: `executions`
  - [ ] Access level: Private (no anonymous access)
- [ ] **Note Storage Details**
  - [ ] Copy Storage Account Name: `________________`
  - [ ] Copy Connection String (for reference): `________________`

#### 1.3 Azure AI Services
- [ ] **Create AI Hub & Services**
  - [ ] Search "Azure AI Studio" → Create new hub
  - [ ] Hub name: `shadow-pivot-ai-hub`
  - [ ] Resource Group: `ShadowPivot`
  - [ ] Region: Same as other resources
  - [ ] AI services name: `shadow-pivot-ai-services`
  - [ ] Wait for deployment (3-5 minutes)
- [ ] **Deploy AI Model**
  - [ ] Go to [Azure AI Studio](https://ai.azure.com)
  - [ ] Create project: `shadow-pivot-ai-project`
  - [ ] Deployments → "+ Create deployment"
  - [ ] Model: `gpt-35-turbo` or `gpt-4`
  - [ ] Deployment name: `gpt-deployment`
  - [ ] Deploy and wait for completion
- [ ] **Note AI Details**
  - [ ] Copy Endpoint URL: `________________`
  - [ ] Copy API Key: `________________`
  - [ ] Copy Deployment Name: `________________`

### Phase 2: Web App Deployment (15-20 minutes)

#### 2.1 Create Azure Web App
- [ ] **Create App Service**
  - [ ] Search "App Services" → "+ Create"
  - [ ] Resource Group: `ShadowPivot`
  - [ ] Name: `shadow-pivot-ai-agentv2` (must match GitHub Actions)
  - [ ] Publish: Container
  - [ ] Operating System: Linux
  - [ ] Region: Same as other resources
  - [ ] Linux Plan: Basic B1 or higher
- [ ] **Configure Container Settings**
  - [ ] Image Source: Other container registries
  - [ ] Access Type: Public
  - [ ] Registry server URL: `https://ghcr.io`
  - [ ] Image and tag: `[YOUR-USERNAME]/shadow-pivot-ai-agentv2:latest`
  - [ ] Registry username: Your GitHub username
  - [ ] Registry password: GitHub Personal Access Token (see instructions)

#### 2.2 Configure Web App Settings
- [ ] **Create GitHub Personal Access Token**
  - [ ] GitHub → Settings → Developer settings → Personal access tokens
  - [ ] Generate classic token with `read:packages` scope
  - [ ] Copy token: `________________`
- [ ] **Set Environment Variables**
  - [ ] Web App → Configuration → Application settings
  - [ ] Add: `WEBSITES_PORT` = `3000`
  - [ ] Add: `NODE_ENV` = `production`
  - [ ] Add: `AZURE_STORAGE_ACCOUNT_NAME` = `[your storage account name]`
  - [ ] Save configuration (app will restart)

### Phase 3: Security & Permissions (10-15 minutes)

#### 3.1 Enable Managed Identity
- [ ] **Enable System-Assigned Identity**
  - [ ] Web App → Identity → System assigned → Status: On → Save
  - [ ] Copy Object (principal) ID: `________________`

#### 3.2 Assign Azure Permissions
- [ ] **Storage Account Permissions**
  - [ ] Storage Account → Access Control (IAM) → Add role assignment
  - [ ] Role: "Storage Blob Data Contributor"
  - [ ] Members: Managed identity → App Service → Select your Web App
  - [ ] Review + assign
- [ ] **AI Services Permissions** (if using AI)
  - [ ] AI Services → Access Control (IAM) → Add role assignment
  - [ ] Role: "Cognitive Services OpenAI User"
  - [ ] Members: Managed identity → App Service → Select your Web App
  - [ ] Review + assign

### Phase 4: GitHub Actions OIDC (10-15 minutes)

#### 4.1 Create Azure Enterprise Application
- [ ] **Register Application**
  - [ ] Azure AD → Enterprise Applications → New application
  - [ ] Name: `GitHub-Actions-OIDC`
  - [ ] Register an application to integrate with Azure AD
  - [ ] Copy Application (client) ID: `________________`
  - [ ] Copy Directory (tenant) ID: `________________`

#### 4.2 Configure Federated Credentials
- [ ] **Set Up OIDC**
  - [ ] App Registrations → Find your app → Certificates & secrets
  - [ ] Federated credentials → Add credential
  - [ ] GitHub Actions deploying Azure resources
  - [ ] Organization: Your GitHub username
  - [ ] Repository: `shadow-pivot-ai-agentv2`
  - [ ] Entity type: Branch
  - [ ] GitHub branch name: `main`
  - [ ] Name: `main-branch-deployment`

#### 4.3 Assign Azure Permissions
- [ ] **Give GitHub Actions Access**
  - [ ] Subscription → Access control (IAM) → Add role assignment
  - [ ] Role: "Website Contributor" (or "Contributor")
  - [ ] Members: Select "User, group, or service principal"
  - [ ] Search and select: `GitHub-Actions-OIDC`
  - [ ] Review + assign

#### 4.4 Configure GitHub Repository
- [ ] **Set Repository Variables**
  - [ ] GitHub repo → Settings → Secrets and variables → Actions
  - [ ] Variables tab → Add variables:
  - [ ] `AZURE_CLIENT_ID`: `[Application client ID]`
  - [ ] `AZURE_TENANT_ID`: `[Directory tenant ID]`
  - [ ] `AZURE_SUBSCRIPTION_ID`: `[Your subscription ID]`

### Phase 5: Local Development Setup (Optional, 10 minutes)

#### 5.1 Install Azure CLI
- [ ] **Install CLI**
  - [ ] Windows: `winget install -e --id Microsoft.AzureCLI`
  - [ ] macOS: `brew install azure-cli`
  - [ ] Linux: `curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash`

#### 5.2 Configure Local Access
- [ ] **Authenticate**
  - [ ] Run: `az login`
  - [ ] Verify: `az account list --output table`
- [ ] **Assign Local Permissions**
  - [ ] Storage Account → IAM → Add your user as "Storage Blob Data Contributor"
  - [ ] AI Services → IAM → Add your user as "Cognitive Services OpenAI User"
- [ ] **Create Local Environment**
  - [ ] Create `.env.local` file with storage account name
  - [ ] Test with simple Azure SDK connection

### Phase 6: Deployment Testing (5-10 minutes)

#### 6.1 Test Automated Deployment
- [ ] **Trigger Deployment**
  - [ ] Make a small code change (e.g., update README)
  - [ ] Push to `main` branch: `git push origin main`
  - [ ] Watch GitHub Actions workflow run
  - [ ] Verify Azure login step succeeds
  - [ ] Confirm Web App restart completes

#### 6.2 Verify Application
- [ ] **Test Web App**
  - [ ] Go to Web App → Overview → click URL
  - [ ] Verify Next.js default page loads
  - [ ] Check Log stream for startup messages
  - [ ] Confirm no error messages in logs

#### 6.3 Test Azure Integrations
- [ ] **Verify Storage Access** (when you add Azure code)
  - [ ] Test blob read/write operations
  - [ ] Confirm Managed Identity authentication works
- [ ] **Verify AI Access** (when you add AI features)
  - [ ] Test API calls to deployed model
  - [ ] Confirm authentication and responses

---

## 🎯 Success Criteria

**✅ Deployment Success** = All of these working:
1. **Web App accessible** via public URL
2. **GitHub Actions workflow** runs successfully on push to main
3. **Container deployment** pulls latest image automatically
4. **Next.js application** loads without errors
5. **Azure Storage** accessible via Managed Identity (when code is added)
6. **AI Services** accessible via Managed Identity (when code is added)

**⏱️ Total Setup Time**: ~60-90 minutes for complete infrastructure

**🚨 Key Success Indicators**:
- Web App status shows "Running"
- GitHub Actions shows green checkmarks
- Application URL loads Next.js page
- Log stream shows successful startup
- No authentication errors in logs

---

## 🆘 Common Issues & Quick Fixes

### Web App Won't Start
- **Check**: `WEBSITES_PORT=3000` is set in Configuration
- **Check**: Container registry credentials are correct
- **Check**: GitHub Actions successfully pushed image

### GitHub Actions Authentication Fails
- **Check**: All 3 repository variables are set correctly
- **Check**: Federated credential matches exact repository name and branch
- **Check**: Enterprise Application has Website Contributor role

### Container Pull Fails
- **Check**: GitHub PAT hasn't expired and has `read:packages` permission
- **Check**: Image path exactly matches GitHub username/repository
- **Check**: Image exists in GitHub Packages tab

### Azure Services Access Denied
- **Check**: Managed Identity is enabled on Web App
- **Check**: RBAC roles are assigned to Web App's Managed Identity
- **Check**: Environment variables contain correct resource names

---

## 📚 Reference Information

**Important URLs to Bookmark**:
- [Azure Portal](https://portal.azure.com)
- [Azure AI Studio](https://ai.azure.com)
- Your Web App URL: `https://shadow-pivot-ai-agentv2.azurewebsites.net`
- GitHub Actions: `https://github.com/[username]/shadow-pivot-ai-agentv2/actions`

**Key Resource Names** (customize for your setup):
- Resource Group: `ShadowPivot`
- Storage Account: `shadowpivotstorage[unique]`
- Web App: `shadow-pivot-ai-agentv2`
- AI Hub: `shadow-pivot-ai-hub`
- AI Services: `shadow-pivot-ai-services`

---

## 🔜 Future (IaC Roadmap)

* Terraform/Bicep scripts to manage all resources
* GitHub Actions workflows for CI/CD deployment
* Auto-rotate credentials and SAS tokens for secure access
