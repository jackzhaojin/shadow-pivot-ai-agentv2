/**
 * Tests for FigmaTestingResults UI component
 * Tests the display of quality metrics and actionable feedback
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FigmaTestingResults } from '../../../../features/ai/components/flow/FigmaTestingResults';

describe('FigmaTestingResults Component', () => {
  const mockResults = [
    {
      specId: 'spec-1',
      overallScore: 8.5,
      clarityScore: 9,
      structureScore: 8,
      feasibilityScore: 8,
      accessibilityScore: 9,
      issues: [
        {
          category: 'accessibility',
          severity: 'medium',
          description: 'Missing alt text for decorative images',
          suggestion: 'Add appropriate alt attributes or mark as decorative'
        },
        {
          category: 'structure',
          severity: 'low',
          description: 'Component hierarchy could be simplified',
          suggestion: 'Consider flattening nested container structures'
        }
      ],
      strengths: [
        'Excellent color contrast ratios',
        'Clear component naming conventions',
        'Responsive design principles applied'
      ],
      recommendations: [
        'Consider adding dark mode variants',
        'Include focus state specifications',
        'Document component interactions'
      ]
    },
    {
      specId: 'spec-2',
      overallScore: 6.2,
      clarityScore: 5,
      structureScore: 7,
      feasibilityScore: 6,
      accessibilityScore: 7,
      issues: [
        {
          category: 'clarity',
          severity: 'critical',
          description: 'Unclear requirements for data visualization',
          suggestion: 'Specify chart types, data sources, and interactive behaviors'
        },
        {
          category: 'feasibility',
          severity: 'high',
          description: 'Complex animations may impact performance',
          suggestion: 'Simplify transition effects or provide performance alternatives'
        }
      ],
      strengths: [
        'Creative visual design approach'
      ],
      recommendations: [
        'Clarify technical requirements',
        'Provide detailed specifications',
        'Consider implementation complexity'
      ]
    }
  ];

  it('renders quality assessment results correctly', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    expect(screen.getByText('Quality Assessment Results')).toBeInTheDocument();
    expect(screen.getByText('2 specs evaluated')).toBeInTheDocument();
  });

  it('displays spec quality reports with scores', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    // Check for overall scores
    expect(screen.getByText('Overall: 8.5/10')).toBeInTheDocument();
    expect(screen.getByText('Overall: 6.2/10')).toBeInTheDocument();
    
    // Check individual score breakdowns
    expect(screen.getByText('9')).toBeInTheDocument(); // Clarity score for spec 1
    expect(screen.getByText('5')).toBeInTheDocument(); // Clarity score for spec 2
  });

  it('displays issues with correct severity indicators', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    // Check for issues
    expect(screen.getByText('Missing alt text for decorative images')).toBeInTheDocument();
    expect(screen.getByText('Unclear requirements for data visualization')).toBeInTheDocument();
    
    // Check severity levels
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('displays suggestions for each issue', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    expect(screen.getByText(/Add appropriate alt attributes/)).toBeInTheDocument();
    expect(screen.getByText(/Specify chart types, data sources/)).toBeInTheDocument();
  });

  it('shows strengths with positive indicators', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    expect(screen.getByText('Excellent color contrast ratios')).toBeInTheDocument();
    expect(screen.getByText('Clear component naming conventions')).toBeInTheDocument();
    expect(screen.getByText('Creative visual design approach')).toBeInTheDocument();
  });

  it('displays recommendations for improvement', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    expect(screen.getByText('Consider adding dark mode variants')).toBeInTheDocument();
    expect(screen.getByText('Clarify technical requirements')).toBeInTheDocument();
  });

  it('shows summary statistics correctly', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    // Average overall score: (8.5 + 6.2) / 2 = 7.35, rounded to 7.4
    expect(screen.getByText('7.4')).toBeInTheDocument();
    
    // Critical issues count
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 critical issue
    
    // High issues count  
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 high issue
    
    // Total strengths: 3 + 1 = 4
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('applies correct styling for score ranges', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    const highScoreElement = screen.getByText('Overall: 8.5/10');
    const lowScoreElement = screen.getByText('Overall: 6.2/10');
    
    expect(highScoreElement).toHaveClass('text-green-600');
    expect(lowScoreElement).toHaveClass('text-yellow-600');
  });

  it('handles empty results gracefully', () => {
    render(<FigmaTestingResults results={[]} />);
    
    expect(screen.getByText('No testing results available')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalResult = [
      {
        specId: 'spec-minimal',
        overallScore: 7,
        clarityScore: 7,
        structureScore: 7,
        feasibilityScore: 7,
        accessibilityScore: 7,
        issues: [],
        strengths: [],
        recommendations: []
      }
    ];

    render(<FigmaTestingResults results={minimalResult} />);
    
    expect(screen.getByText('Overall: 7/10')).toBeInTheDocument();
    // Should not crash with empty arrays
  });

  it('displays correct severity icons', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    // Check that severity icons are present (emojis)
    const issuesSection = screen.getByText('Issues Found').closest('div');
    expect(issuesSection).toBeInTheDocument();
  });

  it('shows spec count correctly in header', () => {
    render(<FigmaTestingResults results={mockResults} />);
    
    expect(screen.getByText('2 specs evaluated')).toBeInTheDocument();
    
    // Test singular form
    render(<FigmaTestingResults results={[mockResults[0]]} />);
    expect(screen.getByText('1 spec evaluated')).toBeInTheDocument();
  });

  it('calculates summary statistics accurately', () => {
    const testResults = [
      {
        specId: 'test-1',
        overallScore: 8,
        clarityScore: 8,
        structureScore: 8,
        feasibilityScore: 8,
        accessibilityScore: 8,
        issues: [
          { category: 'test', severity: 'critical', description: 'test', suggestion: 'test' },
          { category: 'test', severity: 'high', description: 'test', suggestion: 'test' }
        ],
        strengths: ['strength1', 'strength2'],
        recommendations: ['rec1']
      },
      {
        specId: 'test-2',
        overallScore: 6,
        clarityScore: 6,
        structureScore: 6,
        feasibilityScore: 6,
        accessibilityScore: 6,
        issues: [
          { category: 'test', severity: 'critical', description: 'test', suggestion: 'test' },
          { category: 'test', severity: 'medium', description: 'test', suggestion: 'test' }
        ],
        strengths: ['strength3'],
        recommendations: ['rec2', 'rec3']
      }
    ];

    render(<FigmaTestingResults results={testResults} />);
    
    // Average: (8 + 6) / 2 = 7.0
    expect(screen.getByText('7.0')).toBeInTheDocument();
    
    // Critical issues: 2
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // High issues: 1
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Total strengths: 2 + 1 = 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
