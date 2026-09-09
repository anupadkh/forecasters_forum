import {
  type TemplateConfig,
  type NodeStyleConfig,
  TEMPLATES_STORAGE_KEY,
  ALL_SECTION_KEYS,
  SECTION_NAMES,
} from './types';
import { BUILTIN_TEMPLATES } from './templatePresets';

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

export const compileNodeStylesToCss = (selector: string, node?: NodeStyleConfig): string => {
  if (!node) return '';
  const lines: string[] = [];
  if (node.hidden) {
    lines.push('display: none !important;');
  }
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
  if (node.customCss) lines.push(node.customCss.trim());

  if (!lines.length) return '';
  return `${selector} {\n  ${lines.join('\n  ')}\n}`;
};

export const generateTemplateCss = (template: TemplateConfig): string => {
  const chunks: string[] = [];

  // Page level rules
  chunks.push(`/* Page Styles: ${template.name} */`);
  chunks.push(`.report-page {
  background-color: ${template.pageBackground || '#ffffff'};
  font-family: ${template.pageFontFamily || 'Arial, sans-serif'};
  color: ${template.pageTextColor || '#2d3748'};
}`);

  // Global custom CSS
  if (template.globalCss && template.globalCss.trim()) {
    chunks.push(`/* Global Custom CSS */\n${template.globalCss.trim()}`);
  }

  // Section and Node rules
  ALL_SECTION_KEYS.forEach((sectionKey) => {
    const sec = template.sections[sectionKey];
    if (!sec || !sec.nodes) return;

    chunks.push(`\n/* Section: ${SECTION_NAMES[sectionKey]} */`);

    // CSS variables for dynamic layout
    const rootNode = sec.nodes.root;
    const imgNode = sec.nodes.image;
    const titleNode = sec.nodes.title;
    const itemTitleNode = sec.nodes.itemTitle;
    const itemDescNode = sec.nodes.itemDesc;

    if (rootNode) {
      const vars: string[] = [];
      if (imgNode?.width) vars.push(`--report-image-width: ${imgNode.width};`);
      if (imgNode?.height) vars.push(`--report-image-height: ${imgNode.height};`);
      if (titleNode?.fontSize) vars.push(`--report-title-size: ${titleNode.fontSize};`);
      if (itemDescNode?.fontSize) vars.push(`--report-body-size: ${itemDescNode.fontSize};`);
      if (itemTitleNode?.textAlign) vars.push(`--report-item-title-align: ${itemTitleNode.textAlign};`);
      if (itemTitleNode?.backgroundColor) vars.push(`--report-item-title-background: ${itemTitleNode.backgroundColor};`);
      if (itemTitleNode?.color) vars.push(`--report-item-title-color: ${itemTitleNode.color};`);
      if (itemTitleNode?.borderColor) vars.push(`--report-item-title-border-color: ${itemTitleNode.borderColor};`);
      if (itemTitleNode?.borderWidth) vars.push(`--report-item-title-border-width: ${itemTitleNode.borderWidth};`);
      if (itemTitleNode?.borderRadius) vars.push(`--report-item-title-border-radius: ${itemTitleNode.borderRadius};`);
      if (sec.layout.columnWidths) {
        vars.push(`--report-grid-template-columns: ${sec.layout.columnWidths};`);
      }
      vars.push(`--report-columns: ${sec.layout.columns || 2};`);

      if (vars.length && rootNode.id) {
        chunks.push(`#${rootNode.id} {\n  ${vars.join('\n  ')}\n}`);
      }
    }

    // Node selectors by ID, prefix, and Class
    Object.entries(sec.nodes).forEach(([, node]) => {
      if (!node) return;
      const selectors: string[] = [];
      if (node.id && node.id.trim()) {
        const cleanId = node.id.trim();
        selectors.push(`#${cleanId}`);
        selectors.push(`[id^="${cleanId}-"]`);
      }
      if (node.className && node.className.trim()) {
        const classNames = node.className.trim().split(/\s+/).filter(Boolean);
        classNames.forEach((cls) => {
          selectors.push(`.${cls}`);
        });
      }

      if (selectors.length) {
        const uniqueSelectors = Array.from(new Set(selectors)).join(',\n');
        const css = compileNodeStylesToCss(uniqueSelectors, node);
        if (css) chunks.push(css);
      }
    });
  });

  return chunks.join('\n\n');
};
