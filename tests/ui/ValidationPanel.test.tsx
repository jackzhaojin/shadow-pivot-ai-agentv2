import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ValidationPanel from '../../../features/ai/components/flow/ValidationPanel';
import { AgentFlowProvider } from '../../../providers/AgentFlowProvider';

// Mock executionTrace object
jest.mock('../../../utils/execution', () => ({
  createExecutionTrace: jest.fn().mockReturnValue({ id: 'test-trace-id', events: [] }),
  logEvent: jest.fn(),
}));

describe('ValidationPanel Component', () => {
  const mockOnValidationComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with pending state', () => {
    render(
      <AgentFlowProvider>
        <ValidationPanel stepIndex={0} onValidationComplete={mockOnValidationComplete} />
      </AgentFlowProvider>
    );

    expect(screen.getByText('Step Validation')).toBeInTheDocument();
    expect(screen.getByText('Is this step result valid and acceptable?')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
    expect(screen.getByText('Invalid')).toBeInTheDocument();
    expect(screen.getByText('Feedback required for marking as invalid')).toBeInTheDocument();
  });

  test('valid button is enabled by default', () => {
    render(
      <AgentFlowProvider>
        <ValidationPanel stepIndex={0} onValidationComplete={mockOnValidationComplete} />
      </AgentFlowProvider>
    );

    const validButton = screen.getByText('Valid').closest('button');
    expect(validButton).not.toBeDisabled();
  });

  test('invalid button is disabled without feedback', () => {
    render(
      <AgentFlowProvider>
        <ValidationPanel stepIndex={0} onValidationComplete={mockOnValidationComplete} />
      </AgentFlowProvider>
    );

    const invalidButton = screen.getByText('Invalid').closest('button');
    expect(invalidButton).toBeDisabled();
  });

  test('marks step as valid when valid button clicked', async () => {
    render(
      <AgentFlowProvider>
        <ValidationPanel stepIndex={0} onValidationComplete={mockOnValidationComplete} />
      </AgentFlowProvider>
    );

    const validButton = screen.getByText('Valid').closest('button');
    fireEvent.click(validButton);

    await waitFor(() => {
      expect(mockOnValidationComplete).toHaveBeenCalledWith(true);
    });
  });

  test('marks step as invalid when invalid button clicked with feedback', async () => {
    render(
      <AgentFlowProvider>
        <ValidationPanel stepIndex={0} onValidationComplete={mockOnValidationComplete} />
      </AgentFlowProvider>
    );

    // Add feedback
    const feedbackInput = screen.getByPlaceholderText('Optional feedback or notes about this step result...');
    fireEvent.change(feedbackInput, { target: { value: 'This is not valid because...' } });

    // Invalid button should now be enabled
    const invalidButton = screen.getByText('Invalid').closest('button');
    expect(invalidButton).not.toBeDisabled();

    // Click the invalid button
    fireEvent.click(invalidButton);

    await waitFor(() => {
      expect(mockOnValidationComplete).toHaveBeenCalledWith(false);
    });
  });

  test('disables buttons during processing', async () => {
    render(
      <AgentFlowProvider>
        <ValidationPanel stepIndex={0} onValidationComplete={mockOnValidationComplete} />
      </AgentFlowProvider>
    );

    const validButton = screen.getByText('Valid').closest('button');
    fireEvent.click(validButton);

    // The validation happens with a setTimeout in the component, so check right after the click
    expect(validButton).toBeDisabled();
  });
});
