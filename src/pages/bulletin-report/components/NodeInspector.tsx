import React from 'react';
import {
  type SectionKey,
  type TemplateConfig,
  type NodeStyleConfig,
  type SectionLayoutConfig,
  SECTION_NAMES,
} from '../types';

type NodeInspectorProps = {
  template: TemplateConfig;
  selectedSectionKey: SectionKey;
  selectedNodeKey: string;
  onUpdateNode: (field: keyof NodeStyleConfig, value: any) => void;
  onUpdateSectionLayout: <K extends keyof SectionLayoutConfig>(
    field: K,
    value: SectionLayoutConfig[K]
  ) => void;
  onUpdateTemplate: (updater: (prev: TemplateConfig) => TemplateConfig) => void;
};

export default function NodeInspector({
  template,
  selectedSectionKey,
  selectedNodeKey,
  onUpdateNode,
  onUpdateSectionLayout,
  onUpdateTemplate,
}: NodeInspectorProps) {
  const currentNode = template.sections[selectedSectionKey]?.nodes[selectedNodeKey] || {
    id: '',
    className: '',
  };
  const currentSectionLayout = template.sections[selectedSectionKey]?.layout || {
    direction: 'column',
    columns: 2,
    numbered: true,
  };
  const isHidden = Boolean(currentNode.hidden);

  return (
    <main className="designer-inspector-panel">
      <div className="inspector-header">
        <h3 className="mb-0">
          Editing: <span className="badge bg-primary">{SECTION_NAMES[selectedSectionKey]}</span> &rarr;{' '}
          <span className="badge bg-dark">{selectedNodeKey}</span>
        </h3>
        <p className="text-muted small mb-0 mt-1">
          Configure HTML identity (ID, Class), visibility toggle, and CSS styling rules for this node.
        </p>
      </div>

      <div className="inspector-scroll-area">
        {/* 1. Identity & Visibility Controls */}
        <fieldset className="inspector-card">
          <legend>Identity & Visibility</legend>
          <div className="row g-3">
            <div className="col-12">
              <div className="p-2 border rounded bg-light d-flex align-items-center justify-content-between">
                <div>
                  <span className="fw-bold small d-block">Node Display Visibility</span>
                  <small className="text-muted">
                    {isHidden ? 'This node is hidden from the report output' : 'This node is visible in the report'}
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="switch-node-visible"
                    checked={!isHidden}
                    onChange={(e) => onUpdateNode('hidden', !e.target.checked)}
                  />
                  <label className="form-check-label small fw-bold" htmlFor="switch-node-visible">
                    {isHidden ? 'Hidden' : 'Visible'}
                  </label>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold">Element ID (#id)</label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                value={currentNode.id || ''}
                onChange={(e) => onUpdateNode('id', e.target.value)}
                placeholder="e.g. report-realized-title"
              />
              <small className="text-muted">Unique element ID applied to rendered HTML</small>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold">CSS Class Names (.class)</label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                value={currentNode.className || ''}
                onChange={(e) => onUpdateNode('className', e.target.value)}
                placeholder="e.g. report-title highlight-badge"
              />
              <small className="text-muted">Space-separated CSS class names</small>
            </div>
          </div>
        </fieldset>

        {/* 2. Section Layout Controls (When Section Root is selected) */}
        {selectedNodeKey === 'root' && selectedSectionKey !== 'metadata' && (
          <fieldset className="inspector-card">
            <legend>Section Layout & Flow Options</legend>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label small">Flow Direction</label>
                <select
                  className="form-select form-select-sm"
                  value={currentSectionLayout.direction}
                  onChange={(e) =>
                    onUpdateSectionLayout(
                      'direction',
                      e.target.value as SectionLayoutConfig['direction']
                    )
                  }
                >
                  <option value="column">Top / Down (Column)</option>
                  <option value="row">Left / Right (Row)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small">Grid Columns</label>
                <select
                  className="form-select form-select-sm"
                  value={currentSectionLayout.columns}
                  onChange={(e) => onUpdateSectionLayout('columns', Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 6].map((cols) => (
                    <option key={cols} value={cols}>
                      {cols} Column{cols > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-12 pt-2">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="switch-numbered"
                    checked={currentSectionLayout.numbered}
                    onChange={(e) => onUpdateSectionLayout('numbered', e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="switch-numbered">
                    Number Section Title (e.g. 1. Realized Weather)
                  </label>
                </div>
              </div>
            </div>
          </fieldset>
        )}

        {/* 3. Typography Styles */}
        <fieldset className="inspector-card">
          <legend>Typography</legend>
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label small">Font Size</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.fontSize || ''}
                onChange={(e) => onUpdateNode('fontSize', e.target.value)}
                placeholder="14px, 1.1rem"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Font Weight</label>
              <select
                className="form-select form-select-sm"
                value={currentNode.fontWeight || 'normal'}
                onChange={(e) => onUpdateNode('fontWeight', e.target.value)}
              >
                <option value="normal">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small">Text Align</label>
              <select
                className="form-select form-select-sm"
                value={currentNode.textAlign || 'left'}
                onChange={(e) => onUpdateNode('textAlign', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small">Text Color</label>
              <div className="input-group input-group-sm">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={currentNode.color?.startsWith('#') ? currentNode.color : '#2d3748'}
                  onChange={(e) => onUpdateNode('color', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={currentNode.color || ''}
                  onChange={(e) => onUpdateNode('color', e.target.value)}
                  placeholder="#2d3748"
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small">Font Family</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.fontFamily || ''}
                onChange={(e) => onUpdateNode('fontFamily', e.target.value)}
                placeholder="Arial, Roboto, sans-serif"
              />
            </div>
          </div>
        </fieldset>

        {/* 4. Background & Borders */}
        <fieldset className="inspector-card">
          <legend>Background & Borders</legend>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small">Background Color</label>
              <div className="input-group input-group-sm">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={
                    currentNode.backgroundColor?.startsWith('#')
                      ? currentNode.backgroundColor
                      : '#ffffff'
                  }
                  onChange={(e) => onUpdateNode('backgroundColor', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={currentNode.backgroundColor || ''}
                  onChange={(e) => onUpdateNode('backgroundColor', e.target.value)}
                  placeholder="#ffffff, transparent"
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small">Border Color</label>
              <div className="input-group input-group-sm">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={
                    currentNode.borderColor?.startsWith('#') ? currentNode.borderColor : '#cbd5e0'
                  }
                  onChange={(e) => onUpdateNode('borderColor', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={currentNode.borderColor || ''}
                  onChange={(e) => onUpdateNode('borderColor', e.target.value)}
                  placeholder="#cbd5e0"
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label small">Border Width</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.borderWidth || ''}
                onChange={(e) => onUpdateNode('borderWidth', e.target.value)}
                placeholder="1px, 2px"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Border Style</label>
              <select
                className="form-select form-select-sm"
                value={currentNode.borderStyle || 'solid'}
                onChange={(e) => onUpdateNode('borderStyle', e.target.value)}
              >
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small">Border Radius</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.borderRadius || ''}
                onChange={(e) => onUpdateNode('borderRadius', e.target.value)}
                placeholder="4px, 8px, 50%"
              />
            </div>
          </div>
        </fieldset>

        {/* 5. Spacing & Dimensions */}
        <fieldset className="inspector-card">
          <legend>Spacing & Dimensions</legend>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small">Padding</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.padding || ''}
                onChange={(e) => onUpdateNode('padding', e.target.value)}
                placeholder="8px, 4px 12px"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Margin</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.margin || ''}
                onChange={(e) => onUpdateNode('margin', e.target.value)}
                placeholder="0 0 8px 0"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Width / Max Width</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.width || ''}
                onChange={(e) => onUpdateNode('width', e.target.value)}
                placeholder="100%, 180px, auto"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Height</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentNode.height || ''}
                onChange={(e) => onUpdateNode('height', e.target.value)}
                placeholder="90px, auto"
              />
            </div>
          </div>
        </fieldset>

        {/* 6. Custom CSS Block for this Node */}
        <fieldset className="inspector-card">
          <legend>Custom CSS Rules (Applied to this Node)</legend>
          <textarea
            className="form-control form-control-sm font-monospace"
            rows={4}
            value={currentNode.customCss || ''}
            onChange={(e) => onUpdateNode('customCss', e.target.value)}
            placeholder="/* e.g. text-transform: uppercase;\nletter-spacing: 0.5px;\ntransition: all 0.2s ease; */"
          />
        </fieldset>

        {/* 7. Global Template CSS */}
        <fieldset className="inspector-card">
          <legend>Global Template CSS Stylesheet</legend>
          <textarea
            className="form-control form-control-sm font-monospace"
            rows={4}
            value={template.globalCss || ''}
            onChange={(e) =>
              onUpdateTemplate((prev) => ({ ...prev, globalCss: e.target.value }))
            }
            placeholder="/* Full template-level CSS overrides */"
          />
        </fieldset>
      </div>
    </main>
  );
}
