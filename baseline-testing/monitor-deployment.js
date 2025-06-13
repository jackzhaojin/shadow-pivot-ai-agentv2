const { DefaultAzureCredential } = require("@azure/identity");
const { WebSiteManagementClient } = require("@azure/arm-appservice");

async function monitorDeployment() {
  console.log("🚀 Monitoring End-to-End Deployment Testing");
  console.log("==============================================");
  
  try {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    
    if (!subscriptionId) {
      console.error("❌ AZURE_SUBSCRIPTION_ID environment variable is required");
      process.exit(1);
    }
    
    const client = new WebSiteManagementClient(credential, subscriptionId);
    const resourceGroupName = "ShadowPivot";
    const appName = "shadow-pivot-ai-agentv2";
    
    console.log("📋 Current Azure App Service Status:");
    try {
      const app = await client.webApps.get(resourceGroupName, appName);
      console.log(`   Name: ${app.name}`);
      console.log(`   State: ${app.state}`);
      console.log(`   Default Hostname: ${app.defaultHostName}`);
      console.log(`   Last Modified: ${app.lastModifiedTimeUtc}`);
    } catch (error) {
      console.error("❌ Failed to get app service details:", error.message);
    }
    
    console.log("");
    console.log("🐳 Current Container Configuration:");
    try {
      const config = await client.webApps.getConfiguration(resourceGroupName, appName);
      if (config.linuxFxVersion) {
        console.log(`   Container Image: ${config.linuxFxVersion}`);
      } else {
        console.log("   No container configuration found");
      }
    } catch (error) {
      console.error("⚠️  Failed to get container configuration:", error.message);
    }
    
    console.log("");
    console.log("📊 Deployment Status:");
    console.log("App URL: https://shadow-pivot-ai-agentv2-fpfzhqgyeqdpdwce.eastus2-01.azurewebsites.net");
    console.log("GitHub Actions: https://github.com/jackzhaojin/shadow-pivot-ai-agentv2/actions");
    
    console.log("");
    console.log("🔍 Testing App Accessibility...");
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch("https://shadow-pivot-ai-agentv2-fpfzhqgyeqdpdwce.eastus2-01.azurewebsites.net", {
        timeout: 10000
      });
      
      if (response.ok) {
        console.log("✅ App is accessible (HTTP " + response.status + ")");
      } else {
        console.log("⚠️  App returned HTTP " + response.status);
      }
    } catch (error) {
      console.log("⚠️  App may not be accessible or still starting up");
      console.log("   Error:", error.message);
    }
    
    console.log("");
    console.log("📝 Recent deployment logs available through Azure portal or REST API");
    console.log("   Note: Use Azure SDKs or Azure portal for detailed log monitoring");
    
  } catch (error) {
    console.error("❌ Monitoring failed:", error.message);
    console.error("   Make sure you have proper Azure credentials configured");
    process.exit(1);
  }
}

monitorDeployment().catch(console.error);
