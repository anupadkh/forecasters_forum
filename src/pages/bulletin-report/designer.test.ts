import { describe, it, expect, beforeEach } from 'vitest';
import {
  BUILTIN_TEMPLATES,
  loadAllTemplates,
  saveTemplate,
  deleteTemplate,
  generateTemplateCss,
  type TemplateConfig,
} from './designer';

describe('Design Template Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default built-in templates when storage is empty', () => {
    const templates = loadAllTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(4);
    expect(templates.some((t) => t.id === 'standard')).toBe(true);
    expect(templates.some((t) => t.id === 'compact')).toBe(true);
    expect(templates.some((t) => t.id === 'wide')).toBe(true);
  });

  it('saves and retrieves a custom named template', () => {
    const base = BUILTIN_TEMPLATES[0];
    const customTemplate: TemplateConfig = {
      ...JSON.parse(JSON.stringify(base)),
      id: 'custom-monsoon-2026',
      name: 'Monsoon High-Contrast Bulletin',
      description: 'Customized layout for extreme weather events',
      isBuiltIn: false,
    };

    saveTemplate(customTemplate);
    const all = loadAllTemplates();
    const found = all.find((t) => t.id === 'custom-monsoon-2026');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Monsoon High-Contrast Bulletin');
  });

  it('deletes a custom template', () => {
    const base = BUILTIN_TEMPLATES[0];
    const customTemplate: TemplateConfig = {
      ...JSON.parse(JSON.stringify(base)),
      id: 'custom-to-delete',
      name: 'Temporary Template',
      isBuiltIn: false,
    };

    saveTemplate(customTemplate);
    expect(loadAllTemplates().some((t) => t.id === 'custom-to-delete')).toBe(true);

    deleteTemplate('custom-to-delete');
    expect(loadAllTemplates().some((t) => t.id === 'custom-to-delete')).toBe(false);
  });

  it('compiles node-level styles, IDs, and custom CSS into a stylesheet', () => {
    const base = BUILTIN_TEMPLATES[0]!;
    const template: TemplateConfig = {
      ...JSON.parse(JSON.stringify(base)),
      id: 'test-compiled',
      name: 'Test Compiled Template',
      pageBackground: '#f0f4f8',
      sections: {
        ...base.sections,
        realized: {
          layout: {
            direction: 'column',
            columns: 3,
            numbered: true,
          },
          nodes: {
            ...base.sections.realized.nodes,
            title: {
              id: 'custom-realized-title-id',
              className: 'custom-realized-title-class',
              fontSize: '20px',
              color: '#ff0000',
              fontWeight: '700',
            },
            subtitle: {
              id: 'custom-realized-subtitle-id',
              className: 'custom-realized-subtitle-class',
              hidden: true,
            },
          },
        },
      },
    };

    const css = generateTemplateCss(template);
    expect(css).toContain('background-color: #f0f4f8');
    expect(css).toContain('#custom-realized-title-id');
    expect(css).toContain('font-size: 20px;');
    expect(css).toContain('color: #ff0000;');
    expect(css).toContain('font-weight: 700;');
    expect(css).toContain('#custom-realized-subtitle-id');
    expect(css).toContain('display: none !important;');
  });
});
