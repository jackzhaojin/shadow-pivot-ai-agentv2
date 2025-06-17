/**
 * Test for Step 5: Figma Spec Selection
 * Tests that the API correctly selects the best Figma spec based on evaluation results
 */

const fs = require('fs');
const path = require('path');

async function testStep5FigmaSelection() {
  console.log('\n🧪 Testing Step 5: Figma Spec Selection...');
  
  try {
    // Sample figma specs and evaluation results (similar to what's in the logs)
    const figmaSpecs = [
      {
        name: "minimalist-login-form-001",
        description: "A minimalist login form with a full-screen background image",
        components: {
          loginForm: {
            type: "form",
            properties: {
              background: "full-screen image",
              style: "minimalist"
            }
          }
        }
      },
      {
        name: "minimalist-login-form-002", 
        description: "Alternative minimalist login form design",
        components: {
          loginForm: {
            type: "form",
            properties: {
              background: "gradient",
              style: "minimalist"
            }
          }
        }
      },
      {
        name: "minimalist-login-form-003",
        description: "Third minimalist login form variation",
        components: {
          loginForm: {
            type: "form", 
            properties: {
              background: "solid color",
              style: "minimalist"
            }
          }
        }
      }
    ];

    const figmaEvaluationResults = [
      {
        specId: "minimalist-login-form-001",
        overallScore: 7.8,
        clarityScore: 8.5,
        structureScore: 7,
        feasibilityScore: 8,
        accessibilityScore: 6.5,
        issues: [
          {
            category: "accessibility",
            severity: "high",
            description: "Color contrast ratio for text elements is below recommended standards",
            suggestion: "Ensure all text elements have a contrast ratio of at least 4.5:1 against the background"
          }
        ],
        strengths: [
          "Minimalist design approach enhances user focus",
          "Responsive layout considerations are well defined"
        ],
        recommendations: [
          "Implement a color palette that meets accessibility standards"
        ]
      },
      {
        specId: "minimalist-login-form-002",
        overallScore: 8.2,
        clarityScore: 8.8,
        structureScore: 7.5,
        feasibilityScore: 8.5,
        accessibilityScore: 7.0,
        issues: [
          {
            category: "feasibility",
            severity: "medium",
            description: "Gradient implementation may be complex",
            suggestion: "Use CSS gradients for better performance"
          }
        ],
        strengths: [
          "Excellent clarity in design specification",
          "Better accessibility than other variants"
        ],
        recommendations: [
          "Consider performance optimization for gradient rendering"
        ]
      },
      {
        specId: "minimalist-login-form-003",
        overallScore: 7.5,
        clarityScore: 7.8,
        structureScore: 7.2,
        feasibilityScore: 8.8,
        accessibilityScore: 6.8,
        issues: [
          {
            category: "structure",
            severity: "low",
            description: "Component structure could be more modular",
            suggestion: "Break down into smaller reusable components"
          }
        ],
        strengths: [
          "High feasibility for implementation",
          "Simple and straightforward design"
        ],
        recommendations: [
          "Enhance modularity for better reusability"
        ]
      }
    ];

    const response = await fetch('http://localhost:3000/api/agent/select-figma-spec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-guid': 'test-user-guid'
      },
      body: JSON.stringify({
        figmaSpecs,
        figmaEvaluationResults
      })
    });

    console.log('📡 API Response Status:', response.status);
    
    if (response.status !== 200) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 API Response Data:', JSON.stringify(data, null, 2));

    // Validate response structure
    if (!data.success) {
      throw new Error('API returned success: false');
    }

    if (!data.selectedSpec) {
      throw new Error('No selectedSpec returned');
    }

    if (!data.reasoning) {
      throw new Error('No reasoning returned');
    }

    // Validate that the best spec was selected (should be spec-002 with score 8.2)
    if (data.selectedSpec.name !== 'minimalist-login-form-002') {
      throw new Error(`Expected minimalist-login-form-002 to be selected, got: ${data.selectedSpec.name}`);
    }

    console.log('✅ Selected Spec:', data.selectedSpec.name);
    console.log('📝 Selection Reasoning:', data.reasoning.substring(0, 200) + '...');
    console.log('🏆 Step 5 Figma Selection Test PASSED');
    
    return true;

  } catch (error) {
    console.error('❌ Step 5 Figma Selection Test FAILED:', error.message);
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testStep5FigmaSelection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testStep5FigmaSelection };
