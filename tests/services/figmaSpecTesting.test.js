/**
 * Tests for figmaSpecTesting service
 * Follows patterns from existing service tests
 */

const path = require('path');
const fs = require('fs');

// Mock the AI client
jest.mock('../../../lib/daos/aiClient', () => ({
  generateChatCompletion: jest.fn()
}));

// Mock prompt utils
jest.mock('../../../lib/utils/promptUtils', () => ({
  loadPromptTemplate: jest.fn(),
  applyTemplate: jest.fn(),
  validateResponse: jest.fn()
}));

describe('figmaSpecTesting Service', () => {
  let testFigmaSpec, testFigmaSpecs;
  let mockGenerateChatCompletion;
  let mockLoadPromptTemplate, mockApplyTemplate, mockValidateResponse;

  beforeAll(async () => {
    // Dynamic import after mocks are set up
    const module = await import('../../../lib/services/figmaSpecTesting');
    testFigmaSpec = module.testFigmaSpec;
    testFigmaSpecs = module.testFigmaSpecs;

    const aiClient = await import('../../../lib/daos/aiClient');
    mockGenerateChatCompletion = aiClient.generateChatCompletion;

    const promptUtils = await import('../../../lib/utils/promptUtils');
    mockLoadPromptTemplate = promptUtils.loadPromptTemplate;
    mockApplyTemplate = promptUtils.applyTemplate;
    mockValidateResponse = promptUtils.validateResponse;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testFigmaSpec', () => {
    const mockSpec = {
      name: 'Test Component',
      description: 'A test component for unit testing',
      components: ['Button', 'Input', 'Card'],
      layout: 'grid',
      features: ['responsive', 'accessible']
    };

    const mockTemplate = {
      systemPrompt: 'You are a Figma spec quality evaluator...',
      userPrompt: 'Evaluate the following spec: {specName}',
      temperature: 0.3,
      schema: {
        type: 'object',
        properties: {
          overallScore: { type: 'number' },
          clarityScore: { type: 'number' },
          structureScore: { type: 'number' },
          feasibilityScore: { type: 'number' },
          accessibilityScore: { type: 'number' },
          issues: { type: 'array' },
          strengths: { type: 'array' },
          recommendations: { type: 'array' }
        }
      }
    };

    const mockAIResponse = {
      overallScore: 8,
      clarityScore: 9,
      structureScore: 8,
      feasibilityScore: 7,
      accessibilityScore: 8,
      issues: [
        {
          category: 'accessibility',
          severity: 'medium',
          description: 'Missing aria-labels for some interactive elements',
          suggestion: 'Add aria-label attributes to improve screen reader compatibility'
        }
      ],
      strengths: [
        'Clear component hierarchy',
        'Well-defined responsive behavior'
      ],
      recommendations: [
        'Consider adding dark mode variants',
        'Include more detailed color specifications'
      ]
    };

    beforeEach(() => {
      mockLoadPromptTemplate.mockReturnValue(mockTemplate);
      mockApplyTemplate.mockReturnValue({
        systemPrompt: 'You are a Figma spec quality evaluator...',
        userPrompt: 'Evaluate the following spec: Test Component',
        temperature: 0.3
      });
      mockValidateResponse.mockReturnValue(mockAIResponse);
      mockGenerateChatCompletion.mockResolvedValue(JSON.stringify(mockAIResponse));
    });

    it('should successfully test a Figma spec', async () => {
      const result = await testFigmaSpec(mockSpec, 0);

      expect(result).toEqual(expect.objectContaining({
        specId: expect.any(String),
        overallScore: 8,
        clarityScore: 9,
        structureScore: 8,
        feasibilityScore: 7,
        accessibilityScore: 8,
        issues: expect.arrayContaining([
          expect.objectContaining({
            category: 'accessibility',
            severity: 'medium',
            description: expect.any(String),
            suggestion: expect.any(String)
          })
        ]),
        strengths: expect.arrayContaining([expect.any(String)]),
        recommendations: expect.arrayContaining([expect.any(String)])
      }));

      expect(mockLoadPromptTemplate).toHaveBeenCalledWith(
        expect.stringContaining('figma-spec-testing')
      );
      expect(mockApplyTemplate).toHaveBeenCalledWith(mockTemplate, {
        specName: 'Test Component',
        specDescription: 'A test component for unit testing',
        components: 'Button, Input, Card'
      });
      expect(mockGenerateChatCompletion).toHaveBeenCalledWith(
        'You are a Figma spec quality evaluator...',
        'Evaluate the following spec: Test Component',
        0.3
      );
    });

    it('should handle missing spec properties gracefully', async () => {
      const incompleteSpec = {
        name: 'Incomplete Spec'
        // missing description and components
      };

      const result = await testFigmaSpec(incompleteSpec, 0);

      expect(mockApplyTemplate).toHaveBeenCalledWith(mockTemplate, {
        specName: 'Incomplete Spec',
        specDescription: 'No description provided',
        components: 'No components specified'
      });
      expect(result).toEqual(expect.objectContaining({
        specId: expect.any(String),
        overallScore: expect.any(Number)
      }));
    });

    it('should handle AI service errors with fallback', async () => {
      mockGenerateChatCompletion.mockRejectedValue(new Error('AI service unavailable'));

      const result = await testFigmaSpec(mockSpec, 0);

      expect(result).toEqual(expect.objectContaining({
        specId: expect.any(String),
        overallScore: 5,
        clarityScore: 5,
        structureScore: 5,
        feasibilityScore: 5,
        accessibilityScore: 5,
        issues: expect.arrayContaining([
          expect.objectContaining({
            category: 'system',
            severity: 'high',
            description: expect.stringContaining('AI service unavailable'),
            suggestion: expect.any(String)
          })
        ]),
        strengths: [],
        recommendations: []
      }));
    });

    it('should handle invalid AI responses with fallback', async () => {
      mockGenerateChatCompletion.mockResolvedValue('invalid json response');
      mockValidateResponse.mockImplementation(() => {
        throw new Error('Invalid response format');
      });

      const result = await testFigmaSpec(mockSpec, 0);

      expect(result).toEqual(expect.objectContaining({
        overallScore: 5,
        issues: expect.arrayContaining([
          expect.objectContaining({
            category: 'parsing',
            severity: 'high'
          })
        ])
      }));
    });
  });

  describe('testFigmaSpecs', () => {
    const mockSpecs = [
      {
        name: 'Spec 1',
        description: 'First test spec',
        components: ['Button']
      },
      {
        name: 'Spec 2',
        description: 'Second test spec',
        components: ['Input', 'Card']
      },
      {
        name: 'Spec 3',
        description: 'Third test spec',
        components: ['Modal', 'Form']
      }
    ];

    beforeEach(() => {
      // Mock successful responses for all specs
      mockLoadPromptTemplate.mockReturnValue({
        systemPrompt: 'System prompt',
        userPrompt: 'User prompt',
        temperature: 0.3
      });
      mockApplyTemplate.mockReturnValue({
        systemPrompt: 'System prompt',
        userPrompt: 'User prompt',
        temperature: 0.3
      });
      mockValidateResponse.mockReturnValue({
        overallScore: 8,
        clarityScore: 8,
        structureScore: 8,
        feasibilityScore: 8,
        accessibilityScore: 8,
        issues: [],
        strengths: ['Good design'],
        recommendations: ['Consider improvements']
      });
      mockGenerateChatCompletion.mockResolvedValue(JSON.stringify({
        overallScore: 8,
        clarityScore: 8,
        structureScore: 8,
        feasibilityScore: 8,
        accessibilityScore: 8,
        issues: [],
        strengths: ['Good design'],
        recommendations: ['Consider improvements']
      }));
    });

    it('should process multiple specs in parallel', async () => {
      const results = await testFigmaSpecs(mockSpecs);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.overallScore === 8)).toBe(true);
      expect(mockGenerateChatCompletion).toHaveBeenCalledTimes(3);
    });

    it('should handle empty spec array', async () => {
      const results = await testFigmaSpecs([]);
      expect(results).toEqual([]);
      expect(mockGenerateChatCompletion).not.toHaveBeenCalled();
    });

    it('should handle mixed success and failure scenarios', async () => {
      // Make the second spec fail
      mockGenerateChatCompletion
        .mockResolvedValueOnce(JSON.stringify({ overallScore: 8, clarityScore: 8, structureScore: 8, feasibilityScore: 8, accessibilityScore: 8, issues: [], strengths: [], recommendations: [] }))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(JSON.stringify({ overallScore: 7, clarityScore: 7, structureScore: 7, feasibilityScore: 7, accessibilityScore: 7, issues: [], strengths: [], recommendations: [] }));

      const results = await testFigmaSpecs(mockSpecs);

      expect(results).toHaveLength(3);
      expect(results[0].overallScore).toBe(8);
      expect(results[1].issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          category: 'system',
          severity: 'high',
          description: expect.stringContaining('Network error')
        })
      ]));
      expect(results[2].overallScore).toBe(7);
    });

    it('should maintain spec order in results', async () => {
      const results = await testFigmaSpecs(mockSpecs);

      results.forEach((result, index) => {
        expect(result.specId).toContain(`spec-${index}`);
      });
    });
  });
});
