/**
 * Tests for the test-figma-specs API endpoint
 * Tests batch processing of Figma spec quality evaluation
 */

import { POST } from '../../../../app/api/agent/test-figma-specs/route';
import { testFigmaSpecs } from '../../../../lib/services/figmaSpecTesting';

// Mock the service
jest.mock('../../../../lib/services/figmaSpecTesting', () => ({
  testFigmaSpecs: jest.fn()
}));

describe('/api/agent/test-figma-specs API Endpoint', () => {
  let mockRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock request
    mockRequest = {
      json: jest.fn()
    };
  });

  const mockFigmaSpecs = [
    {
      name: 'Dashboard Component',
      description: 'A comprehensive dashboard with multiple widgets',
      components: ['Chart', 'Table', 'Filter'],
      layout: 'grid',
      features: ['responsive', 'interactive']
    },
    {
      name: 'User Profile Card',
      description: 'A card component displaying user information',
      components: ['Avatar', 'Text', 'Button'],
      layout: 'flex',
      features: ['hoverable', 'clickable']
    }
  ];

  const mockTestingResults = [
    {
      specId: 'spec-0',
      overallScore: 8.2,
      clarityScore: 9,
      structureScore: 8,
      feasibilityScore: 7,
      accessibilityScore: 9,
      issues: [
        {
          category: 'feasibility',
          severity: 'medium',
          description: 'Complex data visualization requirements',
          suggestion: 'Consider using established chart libraries'
        }
      ],
      strengths: [
        'Clear component hierarchy',
        'Well-defined responsive behavior'
      ],
      recommendations: [
        'Add loading states for data-heavy components',
        'Consider performance optimization for large datasets'
      ]
    },
    {
      specId: 'spec-1',
      overallScore: 9.1,
      clarityScore: 9,
      structureScore: 9,
      feasibilityScore: 9,
      accessibilityScore: 9,
      issues: [],
      strengths: [
        'Simple and focused component',
        'Excellent accessibility considerations',
        'Clear interaction patterns'
      ],
      recommendations: [
        'Consider adding animation specifications',
        'Document hover and focus states'
      ]
    }
  ];

  it('should successfully process figma specs and return testing results', async () => {
    mockRequest.json.mockResolvedValue({ figmaSpecs: mockFigmaSpecs });
    testFigmaSpecs.mockResolvedValue(mockTestingResults);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      success: true,
      testingResults: mockTestingResults,
      message: 'Figma specs tested successfully'
    });

    expect(testFigmaSpecs).toHaveBeenCalledWith(mockFigmaSpecs);
  });

  it('should handle missing figmaSpecs in request body', async () => {
    mockRequest.json.mockResolvedValue({});

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      success: false,
      error: 'Missing figmaSpecs in request body'
    });

    expect(testFigmaSpecs).not.toHaveBeenCalled();
  });

  it('should handle empty figmaSpecs array', async () => {
    mockRequest.json.mockResolvedValue({ figmaSpecs: [] });
    testFigmaSpecs.mockResolvedValue([]);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      success: true,
      testingResults: [],
      message: 'Figma specs tested successfully'
    });

    expect(testFigmaSpecs).toHaveBeenCalledWith([]);
  });

  it('should handle invalid JSON in request body', async () => {
    mockRequest.json.mockRejectedValue(new Error('Invalid JSON'));

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      success: false,
      error: 'Invalid request body'
    });

    expect(testFigmaSpecs).not.toHaveBeenCalled();
  });

  it('should handle service errors gracefully', async () => {
    mockRequest.json.mockResolvedValue({ figmaSpecs: mockFigmaSpecs });
    testFigmaSpecs.mockRejectedValue(new Error('AI service unavailable'));

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      success: false,
      error: 'Failed to test figma specs: AI service unavailable'
    });
  });

  it('should handle non-array figmaSpecs', async () => {
    mockRequest.json.mockResolvedValue({ figmaSpecs: 'not-an-array' });

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      success: false,
      error: 'figmaSpecs must be an array'
    });

    expect(testFigmaSpecs).not.toHaveBeenCalled();
  });

  it('should validate figma spec structure', async () => {
    const invalidSpecs = [
      { name: 'Valid Spec', description: 'Has required fields' },
      { description: 'Missing name field' }, // Invalid - no name
      'not-an-object' // Invalid - not an object
    ];

    mockRequest.json.mockResolvedValue({ figmaSpecs: invalidSpecs });

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('validation');
  });

  it('should handle large batch of specs', async () => {
    const largeSpecBatch = Array.from({ length: 10 }, (_, i) => ({
      name: `Spec ${i + 1}`,
      description: `Description for spec ${i + 1}`,
      components: [`Component${i + 1}`]
    }));

    const largeResultBatch = largeSpecBatch.map((_, i) => ({
      specId: `spec-${i}`,
      overallScore: 7 + (i % 3),
      clarityScore: 7,
      structureScore: 7,
      feasibilityScore: 7,
      accessibilityScore: 7,
      issues: [],
      strengths: [`Strength for spec ${i + 1}`],
      recommendations: [`Recommendation for spec ${i + 1}`]
    }));

    mockRequest.json.mockResolvedValue({ figmaSpecs: largeSpecBatch });
    testFigmaSpecs.mockResolvedValue(largeResultBatch);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.testingResults).toHaveLength(10);
    expect(testFigmaSpecs).toHaveBeenCalledWith(largeSpecBatch);
  });

  it('should preserve spec order in results', async () => {
    mockRequest.json.mockResolvedValue({ figmaSpecs: mockFigmaSpecs });
    testFigmaSpecs.mockResolvedValue(mockTestingResults);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.testingResults[0].specId).toBe('spec-0');
    expect(responseData.testingResults[1].specId).toBe('spec-1');
  });

  it('should include performance metrics in response', async () => {
    mockRequest.json.mockResolvedValue({ figmaSpecs: mockFigmaSpecs });
    testFigmaSpecs.mockResolvedValue(mockTestingResults);

    const startTime = Date.now();
    const response = await POST(mockRequest);
    const responseData = await response.json();
    const endTime = Date.now();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    
    // Check that the response was reasonably fast (within 5 seconds for test)
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
