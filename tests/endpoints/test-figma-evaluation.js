#!/usr/bin/env node

/**
 * Figma Evaluation Endpoint Test
 * 
 * Tests the /api/agent/evaluate-figma-specs endpoint in isolation
 * with realistic test data.
 * 
 * Usage:
 *   node tests/endpoints/test-figma-evaluation.js
 * 
 * Prerequisites:
 *   - Server running on localhost:3000
 *   - .env.local with AZURE_OPENAI_API_KEY configured
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const ENDPOINT = '/api/agent/evaluate-figma-specs';
const TEST_USER_GUID = 'test-figma-eval-' + Date.now();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logStep(step, message) {
  log(`🔄 [${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

async function loadTestData() {
  try {
    const testDataPath = path.join(__dirname, 'figma-eval-input.json');
    const testDataContent = fs.readFileSync(testDataPath, 'utf8');
    const testData = JSON.parse(testDataContent);
    logSuccess(`Loaded test data with ${testData.figmaSpecs.length} Figma specs`);
    return testData;
  } catch (error) {
    logError(`Failed to load test data: ${error.message}`);
    process.exit(1);
  }
}

async function testServerConnection() {
  try {
    logStep('1', 'Testing server connection...');
    const response = await fetch(`${SERVER_URL}/api/agent/test-connection`);
    if (response.ok) {
      logSuccess('Server is running and accessible');
      return true;
    } else {
      logError(`Server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to connect to server: ${error.message}`);
    logWarning('Make sure the development server is running: npm run dev');
    return false;
  }
}

async function testFigmaEvaluationEndpoint(testData) {
  try {
    logStep('2', 'Testing Figma evaluation endpoint...');
    
    const startTime = Date.now();
    
    const response = await fetch(`${SERVER_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-guid': TEST_USER_GUID
      },
      body: JSON.stringify(testData)
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    log(`📊 Response Status: ${response.status} ${response.statusText}`, 'cyan');
    log(`⏱️ Request Duration: ${duration}ms`, 'cyan');

    if (!response.ok) {
      const errorText = await response.text();
      logError(`API request failed with status ${response.status}`);
      logError(`Error details: ${errorText}`);
      return false;
    }

    const responseData = await response.json();
    
    logSuccess('API request completed successfully');
    
    // Validate response structure
    if (!responseData.evaluationResults || !Array.isArray(responseData.evaluationResults)) {
      logError('Invalid response format: missing evaluationResults array');
      return false;
    }

    logSuccess(`Received ${responseData.evaluationResults.length} evaluation results`);

    // Analyze results
    responseData.evaluationResults.forEach((result, index) => {
      log(`📋 Spec ${index + 1} Results:`, 'cyan');
      log(`   Overall Score: ${result.overallScore || 'N/A'}`);
      log(`   Clarity Score: ${result.clarityScore || 'N/A'}`);
      log(`   Structure Score: ${result.structureScore || 'N/A'}`);
      log(`   Feasibility Score: ${result.feasibilityScore || 'N/A'}`);
      log(`   Accessibility Score: ${result.accessibilityScore || 'N/A'}`);
      log(`   Issues Found: ${result.issues ? result.issues.length : 0}`);
      log(`   Strengths: ${result.strengths ? result.strengths.length : 0}`);
      log(`   Recommendations: ${result.recommendations ? result.recommendations.length : 0}`);
      
      if (result.issues && result.issues.length > 0) {
        log(`   Top Issues:`, 'yellow');
        result.issues.slice(0, 3).forEach(issue => {
          log(`     • [${issue.severity}] ${issue.description?.substring(0, 80)}...`);
        });
      }
      
      console.log(); // Empty line for readability
    });

    // Calculate average scores
    const avgOverallScore = responseData.evaluationResults.reduce((sum, r) => sum + (r.overallScore || 0), 0) / responseData.evaluationResults.length;
    const totalIssues = responseData.evaluationResults.reduce((sum, r) => sum + (r.issues ? r.issues.length : 0), 0);
    
    log(`📊 Summary Statistics:`, 'cyan');
    log(`   Average Overall Score: ${avgOverallScore.toFixed(2)}/10`);
    log(`   Total Issues Found: ${totalIssues}`);
    log(`   Response Time: ${duration}ms`);

    return true;

  } catch (error) {
    logError(`Test failed with error: ${error.message}`);
    return false;
  }
}

async function runTest() {
  log('🧪 Starting Figma Evaluation Endpoint Test', 'cyan');
  log(`🔗 Target: ${SERVER_URL}${ENDPOINT}`, 'cyan');
  log(`👤 User GUID: ${TEST_USER_GUID}`, 'cyan');
  console.log();

  // Step 1: Load test data
  const testData = await loadTestData();

  // Step 2: Test server connection
  const serverOk = await testServerConnection();
  if (!serverOk) {
    process.exit(1);
  }

  // Step 3: Test the Figma evaluation endpoint
  const testPassed = await testFigmaEvaluationEndpoint(testData);

  console.log();
  if (testPassed) {
    logSuccess('🎉 All tests passed! Figma evaluation endpoint is working correctly.');
    process.exit(0);
  } else {
    logError('💥 Test failed! Check the error messages above.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the test
runTest();
