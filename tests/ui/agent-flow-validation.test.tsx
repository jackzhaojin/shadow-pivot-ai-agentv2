import { render, act } from '@testing-library/react';
import { useAgentFlow, AgentFlowProvider } from '../../../providers/AgentFlowProvider';

// Mock execution utils
jest.mock('../../../utils/execution', () => ({
  createExecutionTrace: jest.fn().mockReturnValue({ id: 'test-trace-id', events: [] }),
  logEvent: jest.fn(),
}));

// Test component that uses the AgentFlow context
const TestComponent = () => {
  const { 
    validatedSteps, 
    invalidatedSteps, 
    markStepValidated, 
    markStepInvalidated,
    startExecution
  } = useAgentFlow();
  
  return (
    <div>
      <button data-testid="start" onClick={startExecution}>Start</button>
      <button data-testid="validate-0" onClick={() => markStepValidated(0)}>Validate Step 0</button>
      <button data-testid="invalidate-0" onClick={() => markStepInvalidated(0, 'Test feedback')}>Invalidate Step 0</button>
      <button data-testid="validate-1" onClick={() => markStepValidated(1)}>Validate Step 1</button>
      <button data-testid="invalidate-1" onClick={() => markStepInvalidated(1, 'Test feedback')}>Invalidate Step 1</button>
      <div data-testid="validated-count">{validatedSteps.size}</div>
      <div data-testid="invalidated-count">{invalidatedSteps.size}</div>
      <div data-testid="is-0-validated">{validatedSteps.has(0) ? 'yes' : 'no'}</div>
      <div data-testid="is-0-invalidated">{invalidatedSteps.has(0) ? 'yes' : 'no'}</div>
    </div>
  );
};

describe('AgentFlowProvider Validation State', () => {
  test('validation state is properly initialized', () => {
    const { getByTestId } = render(
      <AgentFlowProvider>
        <TestComponent />
      </AgentFlowProvider>
    );
    
    // Check initial state
    expect(getByTestId('validated-count').textContent).toBe('0');
    expect(getByTestId('invalidated-count').textContent).toBe('0');
    expect(getByTestId('is-0-validated').textContent).toBe('no');
    expect(getByTestId('is-0-invalidated').textContent).toBe('no');
  });
  
  test('validation state is reset on startExecution', () => {
    const { getByTestId } = render(
      <AgentFlowProvider>
        <TestComponent />
      </AgentFlowProvider>
    );
    
    // Validate a step
    act(() => {
      getByTestId('validate-0').click();
    });
    
    // Verify it's validated
    expect(getByTestId('is-0-validated').textContent).toBe('yes');
    
    // Start execution (should reset state)
    act(() => {
      getByTestId('start').click();
    });
    
    // Verify state is reset
    expect(getByTestId('validated-count').textContent).toBe('0');
    expect(getByTestId('is-0-validated').textContent).toBe('no');
  });
  
  test('markStepValidated adds step to validatedSteps and removes from invalidatedSteps', () => {
    const { getByTestId } = render(
      <AgentFlowProvider>
        <TestComponent />
      </AgentFlowProvider>
    );
    
    // First invalidate the step
    act(() => {
      getByTestId('invalidate-0').click();
    });
    
    // Verify it's invalidated
    expect(getByTestId('is-0-invalidated').textContent).toBe('yes');
    expect(getByTestId('is-0-validated').textContent).toBe('no');
    
    // Then validate the step
    act(() => {
      getByTestId('validate-0').click();
    });
    
    // Verify it's now validated and no longer invalidated
    expect(getByTestId('is-0-validated').textContent).toBe('yes');
    expect(getByTestId('is-0-invalidated').textContent).toBe('no');
  });
  
  test('markStepInvalidated adds step to invalidatedSteps and removes from validatedSteps', () => {
    const { getByTestId } = render(
      <AgentFlowProvider>
        <TestComponent />
      </AgentFlowProvider>
    );
    
    // First validate the step
    act(() => {
      getByTestId('validate-0').click();
    });
    
    // Verify it's validated
    expect(getByTestId('is-0-validated').textContent).toBe('yes');
    expect(getByTestId('is-0-invalidated').textContent).toBe('no');
    
    // Then invalidate the step
    act(() => {
      getByTestId('invalidate-0').click();
    });
    
    // Verify it's now invalidated and no longer validated
    expect(getByTestId('is-0-validated').textContent).toBe('no');
    expect(getByTestId('is-0-invalidated').textContent).toBe('yes');
  });
  
  test('multiple steps can be validated independently', () => {
    const { getByTestId } = render(
      <AgentFlowProvider>
        <TestComponent />
      </AgentFlowProvider>
    );
    
    // Validate step 0
    act(() => {
      getByTestId('validate-0').click();
    });
    
    // Invalidate step 1
    act(() => {
      getByTestId('invalidate-1').click();
    });
    
    // Verify counts
    expect(getByTestId('validated-count').textContent).toBe('1');
    expect(getByTestId('invalidated-count').textContent).toBe('1');
  });
});
