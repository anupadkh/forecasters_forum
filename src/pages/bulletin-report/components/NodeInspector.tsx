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

        {/* 2. Section Layout Controls (When Section Root or Content is selected) */}
        {(selectedNodeKey === 'root' || selectedNodeKey === 'content') && selectedSectionKey !== 'metadata' && (() => {
          const colCount = currentSectionLayout.columns || 2;
          const currentWidths = currentSectionLayout.columnWidths || Array(colCount).fill('1fr').join(' ');
          
          const parseFrTracks = (raw: string | undefined, count: number): number[] => {
            if (!raw) return Array(count).fill(1);
            const parts = raw.trim().split(/\s+/);
            const numbers = parts.map((p) => {
              const num = parseFloat(p.replace(/fr/i, ''));
              return isNaN(num) || num <= 0 ? 1 : num;
            });
            while (numbers.length < count) numbers.push(1);
            return numbers.slice(0, count);
          };

          const trackColors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2'];
          const parsedTracks = parseFrTracks(currentWidths, colCount);
          const totalFr = parsedTracks.reduce((acc, curr) => acc + curr, 0) || 1;

          const presets = {
            1: [{ label: '1fr (Full)', value: '1fr' }],
            2: [
              { label: '1fr 1fr (1:1 Equal)', value: '1fr 1fr' },
              { label: '2fr 1fr (2:1 Left heavy)', value: '2fr 1fr' },
              { label: '1fr 2fr (1:2 Right heavy)', value: '1fr 2fr' },
              { label: '3fr 1fr (3:1)', value: '3fr 1fr' },
              { label: '1fr 3fr (1:3)', value: '1fr 3fr' },
              { label: '1.5fr 1fr (3:2)', value: '1.5fr 1fr' },
              { label: '1fr 1.5fr (2:3)', value: '1fr 1.5fr' },
            ],
            3: [
              { label: '1fr 1fr 1fr (1:1:1 Equal)', value: '1fr 1fr 1fr' },
              { label: '2fr 1fr 1fr (2:1:1)', value: '2fr 1fr 1fr' },
              { label: '1fr 2fr 1fr (1:2:1 Center)', value: '1fr 2fr 1fr' },
              { label: '1fr 1fr 2fr (1:1:2)', value: '1fr 1fr 2fr' },
              { label: '2fr 2fr 1fr (2:2:1)', value: '2fr 2fr 1fr' },
            ],
            4: [
              { label: '1fr 1fr 1fr 1fr (Equal)', value: '1fr 1fr 1fr 1fr' },
              { label: '2fr 1fr 1fr 1fr', value: '2fr 1fr 1fr 1fr' },
              { label: '1fr 2fr 1fr 1fr', value: '1fr 2fr 1fr 1fr' },
              { label: '1fr 1fr 2fr 1fr', value: '1fr 1fr 2fr 1fr' },
              { label: '1fr 1fr 1fr 2fr', value: '1fr 1fr 1fr 2fr' },
            ],
            6: [
              { label: '1fr 1fr 1fr 1fr 1fr 1fr (Equal)', value: '1fr 1fr 1fr 1fr 1fr 1fr' },
            ],
          }[colCount] || [];

          return (
            <fieldset className="inspector-card">
              <legend>Section Layout & Grid Column Widths (fr)</legend>
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
                    value={colCount}
                    onChange={(e) => {
                      const newCols = Number(e.target.value);
                      onUpdateSectionLayout('columns', newCols);
                      onUpdateSectionLayout('columnWidths', Array(newCols).fill('1fr').join(' '));
                    }}
                  >
                    {[1, 2, 3, 4, 6].map((cols) => (
                      <option key={cols} value={cols}>
                        {cols} Column{cols > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Column Widths in fr */}
                <div className="col-12 pt-1">
                  <label className="form-label small fw-bold d-flex justify-content-between">
                    <span>Column Width Ratios (fr tracks)</span>
                    <span className="text-muted font-monospace">{currentWidths}</span>
                  </label>

                  {/* Quick Ratio Presets */}
                  {presets.length > 0 && (
                    <div className="fr-preset-btn-group mb-2">
                      {presets.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          className={`fr-preset-btn ${currentWidths.trim() === p.value ? 'active' : ''}`}
                          onClick={() => onUpdateSectionLayout('columnWidths', p.value)}
                          title={`Set column width ratio to ${p.value}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Visual Column Proportion Bar */}
                  <div className="fr-track-bar-container" title="Visual representation of column width ratios">
                    {parsedTracks.map((fr, idx) => {
                      const pct = Math.round((fr / totalFr) * 100);
                      return (
                        <div
                          key={idx}
                          className="fr-track-segment"
                          style={{
                            width: `${(fr / totalFr) * 100}%`,
                            backgroundColor: trackColors[idx % trackColors.length],
                          }}
                        >
                          Col {idx + 1} ({fr}fr / {pct}%)
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Per-column fr inputs */}
                {colCount > 1 && (
                  <div className="col-12 pt-1">
                    <label className="form-label small text-muted mb-1">Adjust Individual Column Widths (fr):</label>
                    <div className="row g-2">
                      {parsedTracks.map((fr, idx) => (
                        <div key={idx} className={`col-${Math.max(12 / colCount, 3)}`}>
                          <div className="input-group input-group-sm">
                            <span
                              className="input-group-text text-white fw-bold"
                              style={{
                                backgroundColor: trackColors[idx % trackColors.length],
                                minWidth: 32,
                                justifyContent: 'center',
                              }}
                            >
                              C{idx + 1}
                            </span>
                            <input
                              type="number"
                              min="0.25"
                              max="10"
                              step="0.25"
                              className="form-control form-control-sm text-center font-monospace"
                              value={fr}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  const updated = [...parsedTracks];
                                  updated[idx] = val;
                                  onUpdateSectionLayout('columnWidths', updated.map((n) => `${n}fr`).join(' '));
                                }
                              }}
                              title={`Column ${idx + 1} width in fr`}
                            />
                            <span className="input-group-text text-muted">fr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom fr text input */}
                <div className="col-12 pt-1">
                  <label className="form-label small text-muted mb-0">Custom CSS Grid Template Track:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={currentSectionLayout.columnWidths || ''}
                    placeholder="e.g. 2fr 1fr, 1.5fr 1fr, minmax(0, 2fr) 1fr"
                    onChange={(e) => onUpdateSectionLayout('columnWidths', e.target.value)}
                  />
                  <small className="text-muted">
                    CSS Grid fractional track sizing (e.g. <code>2fr 1fr</code> gives the 1st column 2x the width of the 2nd column)
                  </small>
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
          );
        })()}

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
