const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const credential = new DefaultAzureCredential();

// Replace with your own Key Vault URL (if testing with Key Vault)
// For testing purposes, you can use a dummy URL - the auth will still be tested
const url = "https://your-keyvault-name.vault.azure.net/";
const client = new SecretClient(url, credential);

async function testAuth() {
  console.log("🔐 Testing Azure authentication...");
  
  try {
    // Set up a timeout for the credential test
    const timeoutMs = 10000; // 10 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Authentication timeout')), timeoutMs)
    );
    
    // Test basic credential functionality with timeout
    const tokenPromise = credential.getToken("https://vault.azure.net/.default");
    const tokenResponse = await Promise.race([tokenPromise, timeoutPromise]);
    
    console.log("✅ Azure credential obtained successfully");
    console.log("   Token type:", tokenResponse.token ? "Valid" : "Invalid");
    console.log("   Expires on:", new Date(tokenResponse.expiresOnTimestamp).toISOString());
    
    // Optional: Test Key Vault access if URL is provided
    if (url.includes("your-keyvault-name")) {
      console.log("⚠️  Key Vault URL not configured - skipping Key Vault test");
      console.log("   To test Key Vault access, update the 'url' variable with your Key Vault URL");
    } else {
      console.log("🔑 Testing Key Vault access...");
      try {
        // List properties instead of getting a specific secret
        const secretProperties = client.listPropertiesOfSecrets();
        const iterator = await Promise.race([
          secretProperties.next(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Key Vault timeout')), 5000))
        ]);
        console.log("✅ Key Vault connection successful");
      } catch (kvError) {
        console.log("⚠️  Key Vault access failed (this is expected if no Key Vault is configured)");
        console.log("   Error:", kvError.message);
      }
    }
    
  } catch (err) {
    console.error("❌ Azure authentication failed:");
    console.error("   Error:", err.message);
    if (err.message.includes('timeout')) {
      console.error("   This may indicate network issues or Azure service unavailability");
    } else {
      console.error("   Make sure you're logged in with 'az login' or have proper environment variables set");
    }
    process.exit(1);
  }
}

console.log("🧪 Azure Authentication Baseline Test");
console.log("=====================================");
testAuth().then(() => {
  console.log("");
  console.log("🎉 Authentication test completed successfully!");
}).catch((error) => {
  console.error("💥 Test failed:", error.message);
  process.exit(1);
});
