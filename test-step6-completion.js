// Test script to check Step 6 auto-completion logic
// This will help us verify if the new useEffect triggers correctly

console.log('🧪 Testing Step 6 auto-completion logic...');

// Simulate the state changes that should trigger Step 6 completion
const testState = {
  currentStep: 6,
  selectedFigmaSpec: {
    name: 'Test Spec',
    description: 'Test description',
    components: []
  },
  aborted: false,
  completed: new Set([0, 1, 2, 3, 4, 5]) // Steps 0-5 are completed
};

console.log('Test State:', {
  currentStep: testState.currentStep,
  hasSelectedSpec: !!testState.selectedFigmaSpec,
  selectedSpecName: testState.selectedFigmaSpec?.name,
  aborted: testState.aborted,
  isStep6Completed: testState.completed.has(6),
  shouldAutoComplete: testState.currentStep === 6 && 
                     testState.selectedFigmaSpec && 
                     !testState.aborted && 
                     !testState.completed.has(6)
});

console.log('✅ Step 6 auto-completion conditions check complete');
