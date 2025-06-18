import { generateChatCompletion } from '../daos/aiClient';
import { loadPromptTemplate, applyTemplate, validateResponse } from '../utils/promptUtils';
import path from 'path';

interface DesignSystemMetadata {
  version?: string;
  brand?: string;
  author?: string;
  colors?: Record<string, unknown>;
}

interface DesignTokens {
  colors?: Record<string, unknown>;
  typography?: Record<string, unknown>;
  spacing?: Record<string, unknown>;
}

interface Components {
  [key: string]: {
    type: string;
    description?: string;
    styling?: string;
    properties?: Record<string, unknown>;
  };
}

interface Grid {
  columns?: number;
  gap?: string;
  rows?: number;
  gutter?: string;
}

interface Spacing {
  base?: string;
  scale?: Record<string, string>;
}

interface ResponsiveSettings {
  breakpoints?: Record<string, string>;
  behavior?: string;
}

interface InteractionStates {
  hover?: boolean;
  focus?: boolean;
  active?: boolean;
  disabled?: boolean;
}

interface Animation {
  name?: string;
  type?: string;
  duration?: string;
  easing?: string;
  trigger?: string;
}

interface Gesture {
  type: string;
  action?: string;
  target?: string;
}

interface ContrastSettings {
  minimum?: string;
  preferred?: string;
  ratio?: string;
}

interface FocusManagement {
  visible?: boolean;
  style?: string;
  logical?: boolean;
}

interface ScreenReader {
  aria?: boolean;
  labels?: boolean | Record<string, string>;
}

interface KeyboardSettings {
  navigation?: boolean;
  shortcuts?: boolean | Record<string, string>;
}

interface CodeSnippets {
  [key: string]: string;
}

interface Asset {
  name: string;
  type: string;
  url?: string;
  size?: string;
}

export interface FigmaSpec {
  name: string;
  description: string;
  designSystem: {
    metadata?: DesignSystemMetadata;
    tokens?: DesignTokens;
    components?: Components;
  };
  layout: {
    structure?: string;
    grid?: Grid;
    spacing?: Spacing;
    responsive?: ResponsiveSettings;
  };
  interactions: {
    states?: InteractionStates;
    animations?: Animation[];
    gestures?: Gesture[];
  };
  accessibility: {
    contrast?: ContrastSettings;
    focusManagement?: FocusManagement;
    screenReader?: ScreenReader;
    keyboard?: KeyboardSettings;
  };
  implementation: {
    technology?: string;
    framework?: string;
    dependencies?: string[];
    codeSnippets?: CodeSnippets;
    assets?: (Asset | string)[];
  };
}

export async function generateFigmaSpec(concept: string, brief = 'Design a UI component'): Promise<FigmaSpec> {
  console.log('🎯 generateFigmaSpec - Starting generation for:', {
    concept: concept?.substring(0, 100) + '...',
    brief: brief?.substring(0, 100) + '...'
  });
  
  const templatePath = path.join('prompts', 'figma-spec-generation', 'v2.json');
  console.log('📁 generateFigmaSpec - Loading template from:', templatePath);
  
  let template, systemPrompt, userPrompt, temperature;
  try {
    template = loadPromptTemplate(templatePath);
    console.log('✅ generateFigmaSpec - Template loaded successfully:', {
      hasTemplate: !!template,
      templateKeys: template ? Object.keys(template) : [],
      systemPromptLength: template?.systemPrompt?.length || 0
    });
    
    const templateResult = applyTemplate(template, { concept, brief });
    systemPrompt = templateResult.systemPrompt;
    userPrompt = templateResult.userPrompt;
    temperature = templateResult.temperature;
    
    console.log('🎨 generateFigmaSpec - Template applied:', {
      systemPromptLength: systemPrompt?.length || 0,
      userPromptLength: userPrompt?.length || 0,
      temperature,
      userPromptPreview: userPrompt?.substring(0, 200) + '...'
    });
  } catch (templateError) {
    console.error('💥 generateFigmaSpec - Template loading/application failed:', templateError);
    throw new Error(`Failed to load or apply template: ${templateError instanceof Error ? templateError.message : 'Unknown template error'}`);
  }

  try {
    console.log('🚀 generateFigmaSpec - Starting AI call for concept:', concept?.substring(0, 100) + '...');
    
    const response = await generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { 
        temperature,
        maxTokens: 3000  // Increased from default 1000 to allow for verbose Figma specs
      }
    );
    
    console.log('📡 generateFigmaSpec - AI response received:', {
      hasResponse: !!response,
      hasChoices: !!response?.choices,
      choicesLength: response?.choices?.length || 0,
      hasFirstChoice: !!response?.choices?.[0],
      hasMessage: !!response?.choices?.[0]?.message,
      hasContent: !!response?.choices?.[0]?.message?.content,
      contentLength: response?.choices?.[0]?.message?.content?.length || 0
    });
    
    const content = response.choices[0]?.message?.content || '';
    
    if (!content) {
      console.error('❌ generateFigmaSpec - Empty response from AI service:', {
        response,
        choices: response?.choices,
        firstChoice: response?.choices?.[0],
        message: response?.choices?.[0]?.message
      });
      throw new Error('Empty response from AI service');
    }
    
    console.log('📄 generateFigmaSpec - Raw AI response content:', content);
    
    let jsonContent = content;
    
    // Try multiple extraction methods for JSON
    // Method 1: Look for code blocks with ```json or ```
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      jsonContent = codeBlockMatch[1].trim();
      console.log('✂️ generateFigmaSpec - Extracted JSON from code block:', jsonContent);
    } else {
      // Method 2: Look for JSON object boundaries
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0].trim();
        console.log('� generateFigmaSpec - Extracted JSON object from content:', jsonContent);
      } else {
        console.log('📝 generateFigmaSpec - No JSON extraction pattern found, using raw content');
      }
    }
    
    let data: FigmaSpec;
    try {
      data = JSON.parse(jsonContent) as FigmaSpec;
      console.log('✅ generateFigmaSpec - Successfully parsed JSON:', data);
    } catch (parseError) {
      console.error('❌ generateFigmaSpec - JSON parsing failed, attempting recovery:', {
        error: parseError,
        jsonContent,
        contentLength: jsonContent.length,
        firstFewChars: jsonContent.substring(0, 200),
        lastFewChars: jsonContent.substring(Math.max(0, jsonContent.length - 200))
      });
      
      // Try to create a reasonable fallback from the content
      console.log('🛠️ generateFigmaSpec - Creating fallback spec from raw content');
      data = {
        name: concept || 'Generated Component',
        description: content.length > 0 ? content.substring(0, 500) + '...' : 'AI-generated Figma specification',
        designSystem: {
          tokens: {
            colors: { primary: '#007bff', neutral: { white: '#ffffff', gray: '#6c757d' } },
            typography: { fontFamilies: { primary: 'Inter, sans-serif' } }
          },
          components: {
            mainContainer: { type: 'container', styling: 'modern, responsive' },
            contentArea: { type: 'layout', styling: 'flexible, accessible' }
          }
        },
        layout: {
          structure: 'responsive grid',
          grid: { columns: 12, gutter: '16px' },
          spacing: { base: '8px' },
          responsive: { breakpoints: { mobile: '768px', tablet: '1024px' } }
        },
        interactions: {
          states: { hover: true, focus: true, active: true },
          animations: [{ type: 'fadeIn', duration: '200ms' }],
          gestures: [{ type: 'tap', action: 'select' }]
        },
        accessibility: {
          contrast: { minimum: '4.5:1' },
          focusManagement: { visible: true, logical: true },
          screenReader: { aria: true, labels: true },
          keyboard: { navigation: true, shortcuts: true }
        },
        implementation: {
          technology: 'React',
          framework: 'Next.js',
          dependencies: ['@emotion/styled', 'framer-motion'],
          codeSnippets: { component: 'const Component = () => { return <div>...</div>; }' },
          assets: ['icons.svg', 'images/']
        }
      };
      
      console.log('🔄 generateFigmaSpec - Using fallback spec:', data);
    }
    
    const validation = validateResponse(data, template);
    if (validation.isValid) {
      console.log('✅ generateFigmaSpec - Validation passed, returning parsed response');
      return validation.parsedResponse as FigmaSpec;
    }
    
    console.warn('⚠️ generateFigmaSpec - Validation failed, but attempting to transform data:', {
      errors: validation.errors,
      originalDataKeys: data && typeof data === 'object' ? Object.keys(data) : 'not an object'
    });
    
    // Try to transform the AI response to match our interface
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const sourceData = data as unknown as Record<string, unknown>;
      const transformed: FigmaSpec = {
        name: (sourceData.name as string) || 'Generated Component',
        description: (sourceData.description as string) || 'AI-generated Figma specification',
        designSystem: (sourceData.designSystem as FigmaSpec['designSystem']) || {},
        layout: (sourceData.layout as FigmaSpec['layout']) || {
          structure: 'responsive',
          grid: { columns: 12 },
          spacing: { base: '8px' },
          responsive: { breakpoints: { mobile: '768px' } }
        },
        interactions: (sourceData.interactions as FigmaSpec['interactions']) || {
          states: { hover: true },
          animations: [],
          gestures: []
        },
        accessibility: (sourceData.accessibility as FigmaSpec['accessibility']) || {
          contrast: { minimum: '4.5:1' },
          focusManagement: { visible: true },
          screenReader: { aria: true },
          keyboard: { navigation: true }
        },
        implementation: (sourceData.implementation as FigmaSpec['implementation']) || {
          technology: 'React',
          framework: 'Next.js',
          dependencies: [],
          codeSnippets: {},
          assets: []
        }
      };
      
      return transformed;
    }
    
    console.warn('⚠️ generateFigmaSpec - Validation failed, using fallback:', {
      errors: validation.errors,
      originalData: data
    });
    // Ensure we return a valid spec even if validation fails
    return {
      name: data.name || concept,
      description: data.description || 'Generated Figma specification',
      designSystem: data.designSystem || {
        tokens: { colors: { primary: '#007bff' } },
        components: { placeholder: { type: 'component' } }
      },
      layout: data.layout || {
        structure: 'responsive',
        grid: { columns: 12 },
        spacing: { base: '8px' },
        responsive: { breakpoints: { mobile: '768px' } }
      },
      interactions: data.interactions || {
        states: { hover: true },
        animations: [],
        gestures: []
      },
      accessibility: data.accessibility || {
        contrast: { minimum: '4.5:1' },
        focusManagement: { visible: true },
        screenReader: { aria: true },
        keyboard: { navigation: true }
      },
      implementation: data.implementation || {
        technology: 'React',
        framework: 'Next.js',
        dependencies: [],
        codeSnippets: {},
        assets: []
      }
    };
  } catch (err) {
    console.error('💥 generateFigmaSpec - Critical error occurred:', {
      error: err,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      errorStack: err instanceof Error ? err.stack : undefined,
      concept: concept?.substring(0, 100) + '...',
      brief: brief?.substring(0, 100) + '...'
    });
    // Return a structured fallback instead of minimal data
    return {
      name: concept,
      description: `Fallback spec for ${concept} - AI generation failed`,
      designSystem: {
        tokens: { colors: { primary: '#007bff' } },
        components: {
          mainContainer: { type: 'container', description: 'Main container' },
          contentArea: { type: 'layout', description: 'Content area' },
          actionButtons: { type: 'controls', description: 'Action buttons' }
        }
      },
      layout: {
        structure: 'fallback layout',
        grid: { columns: 12 },
        spacing: { base: '8px' },
        responsive: { breakpoints: { mobile: '768px' } }
      },
      interactions: {
        states: { hover: true },
        animations: [],
        gestures: []
      },
      accessibility: {
        contrast: { minimum: '4.5:1' },
        focusManagement: { visible: true },
        screenReader: { aria: true },
        keyboard: { navigation: true }
      },
      implementation: {
        technology: 'React',
        framework: 'Next.js',
        dependencies: [],
        codeSnippets: {},
        assets: []
      }
    };
  }
}

export async function generateFigmaSpecs(concept: string, count = 3, brief?: string): Promise<FigmaSpec[]> {
  console.log('🚀 generateFigmaSpecs - Starting parallel generation:', {
    concept: concept?.substring(0, 100) + '...',
    count,
    brief: brief?.substring(0, 100) + '...'
  });
  
  // Execute all spec generations in parallel for better performance
  const promises = Array.from({ length: count }, (_, index) => {
    console.log(`📡 generateFigmaSpecs - Creating promise ${index + 1}/${count}`);
    return generateFigmaSpec(concept, brief);
  });
  
  try {
    console.log('⏳ generateFigmaSpecs - Waiting for all promises to resolve...');
    const results = await Promise.all(promises);
    console.log('✅ generateFigmaSpecs - All promises resolved successfully:', {
      resultsCount: results.length,
      allValid: results.every(r => r && r.name && r.description && r.designSystem)
    });
    return results;
  } catch (error) {
    console.error('❌ generateFigmaSpecs - Some promises failed, using allSettled fallback:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return partial results with fallbacks for failed generations
    const results = await Promise.allSettled(promises);
    console.log('🔄 generateFigmaSpecs - Promise.allSettled results:', {
      totalPromises: results.length,
      fulfilledCount: results.filter(r => r.status === 'fulfilled').length,
      rejectedCount: results.filter(r => r.status === 'rejected').length
    });
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ generateFigmaSpecs - Promise ${index + 1} fulfilled:`, result.value.name);
        return result.value;
      } else {
        console.error(`❌ generateFigmaSpecs - Promise ${index + 1} rejected:`, result.reason);
        return {
          name: `${concept} - Spec ${index + 1}`,
          description: 'Failed to generate - fallback spec',
          designSystem: {
            tokens: { colors: { primary: '#007bff' } },
            components: { errorPlaceholder: { type: 'placeholder', description: 'Error placeholder' } }
          },
          layout: {
            structure: 'error fallback',
            grid: { columns: 12 },
            spacing: { base: '8px' },
            responsive: { breakpoints: { mobile: '768px' } }
          },
          interactions: {
            states: { hover: true },
            animations: [],
            gestures: []
          },
          accessibility: {
            contrast: { minimum: '4.5:1' },
            focusManagement: { visible: true },
            screenReader: { aria: true },
            keyboard: { navigation: true }
          },
          implementation: {
            technology: 'React',
            framework: 'Next.js',
            dependencies: [],
            codeSnippets: {},
            assets: []
          }
        };
      }
    });
  }
}
