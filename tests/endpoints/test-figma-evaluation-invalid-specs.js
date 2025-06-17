#!/usr/bin/env node

/**
 * Test for Figma evaluation endpoint with invalid specs
 * This test verifies that the API correctly filters out invalid specs
 * and continues processing with the valid ones (defect fix)
 */

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const ENDPOINT = '/api/agent/evaluate-figma-specs';
const TEST_USER_GUID = 'test-invalid-specs-' + Date.now();

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

// Test data with some invalid specs (missing name field)
const testData = {
  figmaSpecs: [
    // Valid spec
    {
      name: "Valid Login Component",
      description: "A clean login form with proper fields",
      components: [
        "Container with rounded corners",
        "Email input field",
        "Password input field", 
        "Login button"
      ]
    },
    // Invalid spec - missing name field
    {
      description: "This spec is missing the name field",
      components: [
        "Some component",
        "Another component"
      ]
    },
    // Another valid spec
    {
      name: "Another Valid Component",
      description: "Another properly structured spec",
      components: [
        "Header section",
        "Content area",
        "Footer section"
      ]
    },
    // Invalid spec - name is null
    {
      name: null,
      description: "This spec has null name",
      components: ["Component 1"]
    },
    // Invalid spec - name is empty string
    {
      name: "",
      description: "This spec has empty name",
      components: ["Component 1"]
    }
  ]
};

async function testServerConnection() {
  try {
    logStep('1', 'Testing server connection...');
    const response = await fetch(`${SERVER_URL}/api/agent/test-connection`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    logSuccess('Server is running and accessible');
    return true;
  } catch (error) {
    logError(`Failed to connect to server: ${error.message}`);
    logWarning('Make sure the development server is running: npm run dev');
    return false;
  }
}

async function testFigmaEvaluationWithInvalidSpecs() {
  log('🧪 Starting Figma Evaluation Test with Invalid Specs');
  log(`🔗 Target: ${SERVER_URL}${ENDPOINT}`);
  log(`👤 User GUID: ${TEST_USER_GUID}`);
  log(`📊 Test data: ${testData.figmaSpecs.length} specs (2 valid, 3 invalid)`);

  try {
    // Test server connection
    const serverOk = await testServerConnection();
    if (!serverOk) {
      process.exit(1);
    }

    // Test the evaluation endpoint with invalid specs
    logStep('2', 'Testing Figma evaluation with invalid specs...');
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

    log(`📊 Response Status: ${response.status} ${response.statusText}`);
    log(`⏱️ Request Duration: ${duration}ms`);

    const responseData = await response.json();

    if (!response.ok) {
      logError('API request failed:');
      console.log(responseData);
      process.exit(1);
    }

    logSuccess('API request completed successfully');

    // Verify the response
    if (!responseData.success) {
      logError('API returned success: false');
      logError('Error: ' + responseData.error);
      process.exit(1);
    }

    if (!responseData.evaluationResults || !Array.isArray(responseData.evaluationResults)) {
      logError('No evaluation results received');
      console.log('Response:', responseData);
      process.exit(1);
    }

    logSuccess(`Received ${responseData.evaluationResults.length} evaluation results`);

    // Check if warning about filtered specs is present
    if (responseData.warning) {
      logWarning(`Warning: ${responseData.warning}`);
      if (responseData.invalidSpecs) {
        log(`📝 Invalid specs details:`, 'cyan');
        responseData.invalidSpecs.forEach(spec => {
          log(`   - Index ${spec.index}: ${spec.reason}`, 'cyan');
        });
      }
    }

    // Verify that we got results for only the valid specs (should be 2)
    const expectedValidSpecs = 2;
    if (responseData.evaluationResults.length !== expectedValidSpecs) {
      logError(`Expected ${expectedValidSpecs} results but got ${responseData.evaluationResults.length}`);
      process.exit(1);
    }

    logSuccess(`Correctly processed ${expectedValidSpecs} valid specs and filtered out ${testData.figmaSpecs.length - expectedValidSpecs} invalid specs`);

    // Verify that we got the warning about filtered specs
    if (!responseData.warning) {
      logError('Expected warning about filtered specs but did not receive one');
      process.exit(1);
    }

    logSuccess('Correctly received warning about filtered invalid specs');

    // Display results
    responseData.evaluationResults.forEach((result, index) => {
      log(`📋 Spec ${index + 1} Results:`);
      log(`   Spec ID: ${result.specId}`);
      log(`   Overall Score: ${result.overallScore}`);
      log(`   Issues Found: ${result.issues.length}`);
    });

    log('📊 Summary Statistics:');
    const avgScore = responseData.evaluationResults.reduce((sum, r) => sum + r.overallScore, 0) / responseData.evaluationResults.length;
    log(`   Average Overall Score: ${avgScore.toFixed(2)}/10`);
    log(`   Valid Specs Processed: ${responseData.evaluationResults.length}`);
    log(`   Invalid Specs Filtered: ${responseData.invalidSpecs ? responseData.invalidSpecs.length : 0}`);
    log(`   Response Time: ${duration}ms`);

    logSuccess('🎉 All tests passed! Invalid spec filtering is working correctly.');

  } catch (error) {
    logError('Test failed with error: ' + error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testFigmaEvaluationWithInvalidSpecs();
