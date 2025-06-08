# Infrastructure Setup Guide for TSLA AI UI Agent

This guide outlines the **manual setup steps** required to provision cloud infrastructure for the MVP of the TSLA AI UI Agent. Infrastructure as Code (IaC) will be added post-MVP.

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

### 5. Deploy Azure Web App or Container App

This will host your Next.js app.

**Steps:**

1. From Azure Portal, search **App Services** or **Container Apps**, and click **"+ Create"**.
2. Select the `ShadowPivot` Resource Group.
3. Name your app (e.g., `shadow-pivot-nextjs`).
4. Choose **Linux OS**, Node.js runtime (LTS).
5. Enable **Continuous Deployment** via GitHub or local deploy.
6. Set environment variables:

   * `AZURE_STORAGE_ACCOUNT=<your storage name>`
   * `AI_ENDPOINT=<your AI Foundry endpoint>`
   * `MCP_SERVER_URL=<your MCP endpoint>`
7. Deploy your app (via zip, GitHub Actions, or Azure CLI).

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

* [ ] Create or confirm `ShadowPivot` resource group
* [ ] Create Azure Storage Account (Hot V2 tier)
* [ ] Create `executions` container inside storage
* [ ] Deploy Azure AI Foundry endpoint
* [ ] Enable Managed Identity on Web App
* [ ] Assign correct RBAC roles
* [ ] Verify local auth using `az login` + SDK
* [ ] Deploy Next.js app and validate integration

---

## 🔜 Future (IaC Roadmap)

* Terraform/Bicep scripts to manage all resources
* GitHub Actions workflows for CI/CD deployment
* Auto-rotate credentials and SAS tokens for secure access
