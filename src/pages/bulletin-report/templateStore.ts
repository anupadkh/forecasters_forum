import {
  type TemplateConfig,
  type NodeStyleConfig,
  type SectionKey,
  type SectionTemplateConfig,
  TEMPLATES_STORAGE_KEY,
  ALL_SECTION_KEYS,
  SECTION_NAMES,
} from './types';
import { BUILTIN_TEMPLATES, getDefaultNodeCss } from './templatePresets';

export const generateFullTemplateCss = (template: TemplateConfig): string => {
  const sections: string[] = [];

  // 1. Page level rules
  sections.push(`/* ==========================================================================
   Page & Canvas Styles
   ========================================================================== */
.report-page {
  background-color: ${template.pageBackground || '#ffffff'};
  font-family: ${template.pageFontFamily || 'Arial, sans-serif'};
  color: ${template.pageTextColor || '#2d3748'};
}`);

  // 2. Section and Node rules
  ALL_SECTION_KEYS.forEach((sectionKey) => {
    const sec = template.sections[sectionKey];
    if (!sec || !sec.nodes) return;

    const nodeBlocks: string[] = [];
    nodeBlocks.push(`/* ==========================================================================
   Section: ${SECTION_NAMES[sectionKey]}
   ========================================================================== */`);

    Object.entries(sec.nodes).forEach(([nodeKey, node]) => {
      const cleanId =
        node.id && node.id.trim()
          ? node.id.trim()
          : `${template.id}-${sectionKey}-${nodeKey}`;
      const defaultCss = getDefaultNodeCss(sectionKey, nodeKey);
      let rawCss = '';
      if (node.customCss !== undefined && node.customCss !== '') {
        rawCss = node.customCss.trim();
      } else if (
        node.fontSize ||
        node.fontWeight ||
        node.fontFamily ||
        node.color ||
        node.backgroundColor ||
        node.textAlign ||
        node.padding ||
        node.margin ||
        node.borderWidth ||
        node.borderStyle ||
        node.borderColor ||
        node.borderRadius ||
        node.boxShadow ||
        node.width ||
        node.height
      ) {
        const compiled = compileNodeStylesToCss(`#${cleanId}`, node);
        const inner = compiled
          .replace(/^#\S+\s*\{\s*/, '')
          .replace(/\s*\}\s*$/, '');
        rawCss = inner.trim();
      } else {
        rawCss = defaultCss;
      }

      const lines: string[] = [];
      if (node.hidden) {
        lines.push('display: none !important;');
      }
      if (rawCss && rawCss.trim()) {
        lines.push(rawCss.trim());
      }

      if (lines.length > 0) {
        nodeBlocks.push(`#${cleanId} {\n  ${lines.join('\n  ')}\n}`);
      }
    });

    if (nodeBlocks.length > 1) {
      sections.push(nodeBlocks.join('\n\n'));
    }
  });

  return sections.join('\n\n');
};

export const updateCssBlockForId = (
  css: string,
  id: string,
  newDeclarations: string
): string => {
  if (!css) {
    return `#${id} {\n  ${newDeclarations.trim().split('\n').join('\n  ')}\n}`;
  }
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(#${escapedId}\\b[^{]*\\{)([^}]*)(\\})`, 'm');
  const formattedDecls = newDeclarations.trim()
    ? `\n  ${newDeclarations.trim().split('\n').join('\n  ')}\n`
    : '\n';
  if (regex.test(css)) {
    return css.replace(regex, `$1${formattedDecls}$3`);
  } else {
    return `${css.trim()}\n\n#${id} {\n  ${newDeclarations.trim().split('\n').join('\n  ')}\n}`;
  }
};

export const updateCssIdSelector = (
  css: string,
  oldId: string,
  newId: string
): string => {
  if (!css || !oldId || !newId || oldId === newId) return css;
  const escapedOld = oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`#${escapedOld}\\b`, 'g');
  return css.replace(regex, `#${newId}`);
};

export const syncGlobalCssToNodes = (
  globalCss: string,
  sections: Record<SectionKey, SectionTemplateConfig>
): Record<SectionKey, SectionTemplateConfig> => {
  const nextSections = JSON.parse(JSON.stringify(sections)) as Record<
    SectionKey,
    SectionTemplateConfig
  >;
  const blockRegex = /#([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(globalCss)) !== null) {
    const id = match[1];
    const body = match[2]?.trim() || '';
    for (const secKey of ALL_SECTION_KEYS) {
      const sec = nextSections[secKey];
      if (!sec || !sec.nodes) continue;
      for (const node of Object.values(sec.nodes)) {
        if (node && (node as NodeStyleConfig).id === id) {
          (node as NodeStyleConfig).customCss = body;
        }
      }
    }
  }
  return nextSections;
};

export const loadAllTemplates = (): TemplateConfig[] => {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const saved: TemplateConfig[] = raw ? JSON.parse(raw) : [];
    const combined = [...BUILTIN_TEMPLATES];
    saved.forEach((custom) => {
      const idx = combined.findIndex((t) => t.id === custom.id);
      if (idx >= 0) {
        combined[idx] = custom;
      } else {
        combined.push(custom);
      }
    });

    // Ensure all templates have complete globalCss containing all node rules
    combined.forEach((template) => {
      ALL_SECTION_KEYS.forEach((sectionKey) => {
        const sec = template.sections[sectionKey];
        if (sec && sec.nodes) {
          Object.entries(sec.nodes).forEach(([nodeKey, node]) => {
            if (node && (node.customCss === undefined || node.customCss === '')) {
              node.customCss = getDefaultNodeCss(sectionKey, nodeKey);
            }
          });
        }
      });

      if (!template.globalCss || !template.globalCss.includes('#')) {
        template.globalCss = generateFullTemplateCss(template);
      }
    });

    return combined;
  } catch {
    return BUILTIN_TEMPLATES;
  }
};

export const saveTemplate = (template: TemplateConfig): void => {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const saved: TemplateConfig[] = raw ? JSON.parse(raw) : [];
    const idx = saved.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      saved[idx] = template;
    } else {
      saved.push(template);
    }
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(saved));
  } catch (err) {
    console.error('Failed to save template', err);
  }
};

export const deleteTemplate = (templateId: string): void => {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const saved: TemplateConfig[] = raw ? JSON.parse(raw) : [];
    const filtered = saved.filter((t) => t.id !== templateId);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete template', err);
  }
};

export const resetTemplateToBuiltin = (templateId: string): TemplateConfig | null => {
  const builtin = BUILTIN_TEMPLATES.find((t) => t.id === templateId);
  if (!builtin) return null;
  saveTemplate(builtin);
  return JSON.parse(JSON.stringify(builtin));
};

export const resetAllTemplatesToDefault = (): TemplateConfig[] => {
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(BUILTIN_TEMPLATES));
  return JSON.parse(JSON.stringify(BUILTIN_TEMPLATES));
};

export const compileNodeStylesToCss = (selector: string, node?: NodeStyleConfig): string => {
  if (!node) return '';
  const lines: string[] = [];
  if (node.hidden) {
    lines.push('display: none !important;');
  }

  if (node.customCss && node.customCss.trim()) {
    lines.push(node.customCss.trim());
  } else {
    if (node.fontSize) lines.push(`font-size: ${node.fontSize};`);
    if (node.fontWeight) lines.push(`font-weight: ${node.fontWeight};`);
    if (node.fontFamily) lines.push(`font-family: ${node.fontFamily};`);
    if (node.color) lines.push(`color: ${node.color};`);
    if (node.backgroundColor) lines.push(`background-color: ${node.backgroundColor};`);
    if (node.textAlign) lines.push(`text-align: ${node.textAlign};`);
    if (node.padding) lines.push(`padding: ${node.padding};`);
    if (node.margin) lines.push(`margin: ${node.margin};`);
    if (node.borderWidth) lines.push(`border-width: ${node.borderWidth};`);
    if (node.borderStyle) lines.push(`border-style: ${node.borderStyle};`);
    if (node.borderColor) lines.push(`border-color: ${node.borderColor};`);
    if (node.borderRadius) lines.push(`border-radius: ${node.borderRadius};`);
    if (node.boxShadow) lines.push(`box-shadow: ${node.boxShadow};`);
    if (node.width) lines.push(`width: ${node.width}; max-width: ${node.width};`);
    if (node.height) lines.push(`height: ${node.height};`);
  }

  if (!lines.length) return '';
  return `${selector} {\n  ${lines.join('\n  ')}\n}`;
};

export const generateTemplateCss = (template: TemplateConfig): string => {
  if (template.globalCss && template.globalCss.trim().includes('{')) {
    return template.globalCss.trim();
  }
  return generateFullTemplateCss(template);
};

