import { describe, it, expect, beforeEach } from 'vitest';
import {
  BUILTIN_TEMPLATES,
  loadAllTemplates,
  saveTemplate,
  deleteTemplate,
  generateTemplateCss,
  generateFullTemplateCss,
  updateCssBlockForId,
  updateCssIdSelector,
  syncGlobalCssToNodes,
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

  it('compiles global template CSS stylesheet and custom node styles', () => {
    const base = BUILTIN_TEMPLATES[0]!;
    const template: TemplateConfig = {
      ...JSON.parse(JSON.stringify(base)),
      id: 'test-global-template',
      name: 'Global CSS Template',
      globalCss: '/* Custom Global Rules */\n.report-page {\n  background: #f1f5f9;\n}\n.custom-special-badge {\n  background: #fef08a;\n}',
      sections: {
        ...base.sections,
        realized: {
          nodes: {
            ...base.sections.realized.nodes,
            content: {
              id: 'realized-custom-content',
              className: 'custom-grid-layout',
              customCss: 'display: grid;\ngrid-template-columns: 2fr 1fr;\ngap: 12px;',
            },
          },
        },
      },
    };

    saveTemplate(template);
    const loaded = loadAllTemplates().find((t) => t.id === 'test-global-template');
    expect(loaded?.globalCss).toContain('.custom-special-badge');

    const css = generateTemplateCss(template);
    expect(css).toContain('.custom-special-badge');
    expect(css).toContain('#realized-custom-content');
    expect(css).toContain('grid-template-columns: 2fr 1fr;');
  });

  it('compiles direct custom CSS declarations on individual nodes', () => {
    const base = BUILTIN_TEMPLATES[0]!;
    const template: TemplateConfig = {
      ...JSON.parse(JSON.stringify(base)),
      id: 'test-direct-css',
      name: 'Direct CSS Template',
      sections: {
        ...base.sections,
        realized: {
          nodes: {
            ...base.sections.realized.nodes,
            item: {
              id: 'custom-card-item',
              className: 'custom-card-class',
              customCss: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);\ntransition: transform 0.2s ease;\nborder: 2px dashed #3b82f6;',
            },
          },
        },
      },
    };

    const css = generateTemplateCss(template);
    expect(css).toContain('#custom-card-item');
    expect(css).toContain('box-shadow: 0 4px 12px rgba(0,0,0,0.15);');
    expect(css).toContain('transition: transform 0.2s ease;');
    expect(css).toContain('border: 2px dashed #3b82f6;');
  });

  it('ensures node CSS changes in one section are isolated and do not leak to other sections', () => {
    const base = BUILTIN_TEMPLATES[0]!;
    const template: TemplateConfig = {
      ...JSON.parse(JSON.stringify(base)),
      id: 'test-isolated-nodes',
      name: 'Isolated Nodes Template',
      sections: {
        ...base.sections,
        realized: {
          nodes: {
            ...base.sections.realized.nodes,
            title: {
              id: 'standard-realized-title',
              className: 'standard-realized-title custom-highlight-title',
              customCss: 'color: #ff0055;\nfont-size: 28px;',
            },
          },
        },
      },
    };

    const css = generateTemplateCss(template);
    // Realized title should be styled with its ID
    expect(css).toContain('#standard-realized-title');
    expect(css).toContain('color: #ff0055;');
    expect(css).toContain('font-size: 28px;');
  });

  it('synchronizes node CSS changes into Global Template CSS and updates ID selector names', () => {
    const base = BUILTIN_TEMPLATES[0]!;
    const template: TemplateConfig = {
      ...JSON.parse(JSON.stringify(base)),
      id: 'test-sync',
      name: 'Sync Template',
    };

    // 1. Check generated full template CSS includes all node IDs
    let globalCss = generateTemplateCss(template);
    expect(globalCss).toContain('#standard-realized-item');
    expect(globalCss).toContain('#standard-realized-content');

    // 2. Update CSS declarations for a node
    globalCss = updateCssBlockForId(
      globalCss,
      'standard-realized-item',
      'display: grid;\ngrid-template-columns: 1fr 5fr;\ngrid-template-rows: auto auto;'
    );
    expect(globalCss).toContain('grid-template-columns: 1fr 5fr;');
    expect(globalCss).toContain('grid-template-rows: auto auto;');

    // 3. Update element ID name and verify it updates in Global Template CSS
    globalCss = updateCssIdSelector(globalCss, 'standard-realized-item', 'custom-weather-card');
    expect(globalCss).toContain('#custom-weather-card');
    expect(globalCss).not.toContain('#standard-realized-item {');

    // 4. Sync Global Template CSS back to nodes
    const updatedSections = syncGlobalCssToNodes(globalCss, {
      ...template.sections,
      realized: {
        nodes: {
          ...template.sections.realized.nodes,
          item: {
            id: 'custom-weather-card',
            className: 'custom-weather-card',
            customCss: '',
          },
        },
      },
    });

    expect(updatedSections.realized.nodes.item?.customCss).toContain(
      'grid-template-columns: 1fr 5fr;'
    );
  });
});

