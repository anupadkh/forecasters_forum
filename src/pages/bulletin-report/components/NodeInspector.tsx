import React, { useState } from 'react';
import {
  type SectionKey,
  type TemplateConfig,
  type NodeStyleConfig,
  SECTION_NAMES,
} from '../types';
import { getDefaultNodeCss } from '../templatePresets';

type NodeInspectorProps = {
  template: TemplateConfig;
  selectedSectionKey: SectionKey;
  selectedNodeKey: string;
  activeTab?: 'node' | 'global';
  onTabChange?: (tab: 'node' | 'global') => void;
  onUpdateNode: (field: keyof NodeStyleConfig, value: any) => void;
  onUpdateGlobalCss?: (newCss: string) => void;
  onUpdateTemplate: (updater: (prev: TemplateConfig) => TemplateConfig) => void;
  onClose?: () => void;
};

export default function NodeInspector({
  template,
  selectedSectionKey,
  selectedNodeKey,
  activeTab: controlledTab,
  onTabChange,
  onUpdateNode,
  onUpdateGlobalCss,
  onUpdateTemplate,
  onClose,
}: NodeInspectorProps) {
  const [internalTab, setInternalTab] = useState<'node' | 'global'>('node');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: 'node' | 'global') => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const currentNode = template.sections[selectedSectionKey]?.nodes[selectedNodeKey] || {
    id: '',
    className: '',
    customCss: '',
  };
  const isHidden = Boolean(currentNode.hidden);
  const defaultNodeCss = getDefaultNodeCss(selectedSectionKey, selectedNodeKey);
  const currentCssValue =
    currentNode.customCss !== undefined && currentNode.customCss !== ''
      ? currentNode.customCss
      : defaultNodeCss;

  const insertCssSnippet = (snippet: string) => {
    const existing = (currentCssValue || '').trim();
    const updated = existing ? `${existing}\n${snippet}` : snippet;
    onUpdateNode('customCss', updated);
  };

  const handleResetNodeCss = () => {
    onUpdateNode('customCss', defaultNodeCss);
  };

  const handleGlobalCssChange = (val: string) => {
    if (onUpdateGlobalCss) {
      onUpdateGlobalCss(val);
    } else {
      onUpdateTemplate((prev) => ({ ...prev, globalCss: val }));
    }
  };

  return (
    <aside className="designer-drawer-panel" aria-label="Node Style & CSS Drawer">
      {/* Drawer Header */}
      <div className="drawer-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-primary">{SECTION_NAMES[selectedSectionKey]}</span>
            <span className="text-muted small">&rarr;</span>
            <span className="badge bg-dark">{selectedNodeKey}</span>
          </div>
          {onClose && (
            <button
              type="button"
              className="btn-close btn-close-sm"
              onClick={onClose}
              aria-label="Close CSS Drawer"
              title="Close Drawer"
            />
          )}
        </div>

        {/* Tab Switcher: Localized Node CSS vs Global Template CSS */}
        <div className="btn-group btn-group-sm w-100 mt-2">
          <button
            type="button"
            className={`btn ${activeTab === 'node' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('node')}
          >
            🎨 Localized Node CSS
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'global' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('global')}
          >
            🌐 Global Template CSS
          </button>
        </div>
      </div>

      <div className="drawer-scroll-area">
        {activeTab === 'node' ? (
          <>
            {/* 1. Identity & Visibility */}
            <fieldset className="inspector-card">
              <legend>Identity & Visibility</legend>
              <div className="row g-2">
                <div className="col-12">
                  <div className="p-2 border rounded bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <span className="fw-bold small d-block">Display Visibility</span>
                      <small className="text-muted">
                        {isHidden ? 'Node is hidden from output' : 'Node is visible'}
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

                <div className="col-6">
                  <label className="form-label small mb-1 fw-bold">Element ID (#id)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={currentNode.id || ''}
                    onChange={(e) => onUpdateNode('id', e.target.value)}
                    placeholder="e.g. realized-title"
                  />
                </div>

                <div className="col-6">
                  <label className="form-label small mb-1 fw-bold">CSS Classes (.class)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={currentNode.className || ''}
                    onChange={(e) => onUpdateNode('className', e.target.value)}
                    placeholder="e.g. badge highlight"
                  />
                </div>
              </div>
            </fieldset>

            {/* 2. Direct Node CSS Editor */}
            <fieldset className="inspector-card">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <legend className="m-0 p-0">Localized Node CSS Declarations</legend>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={handleResetNodeCss}
                  title="Reset this node's CSS to default values"
                >
                  ↺ Reset Node CSS
                </button>
              </div>
              <p className="text-muted small mb-2">
                Manipulate CSS rules directly for <code>#{currentNode.id || selectedNodeKey}</code>:
              </p>

              {/* Quick Snippet Insert Buttons */}
              <div className="d-flex flex-wrap gap-1 mb-2">
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('background-color: #f0fdf4;\ncolor: #166534;')}
                >
                  + Color/BG
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('padding: 10px 14px;\nmargin-bottom: 8px;')}
                >
                  + Spacing
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('border: 1px solid #cbd5e1;\nborder-radius: 6px;')}
                >
                  + Border
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('box-shadow: 0 2px 8px rgba(0,0,0,0.08);')}
                >
                  + Shadow
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('font-size: 14px;\nfont-weight: 700;')}
                >
                  + Font
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('display: grid;\ngrid-template-columns: repeat(2, minmax(0, 1fr));\ngap: 8px;')}
                >
                  + Grid (2 Cols)
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('display: grid;\ngrid-template-columns: repeat(3, minmax(0, 1fr));\ngap: 8px;')}
                >
                  + Grid (3 Cols)
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('display: grid;\ngrid-template-columns: 1fr;\ngap: 6px;')}
                >
                  + Single Col
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary"
                  onClick={() => insertCssSnippet('display: flex;\nalign-items: center;\ngap: 8px;')}
                >
                  + Flexbox
                </button>
              </div>

              <textarea
                className="form-control form-control-sm font-monospace node-css-textarea"
                rows={10}
                value={currentCssValue}
                onChange={(e) => onUpdateNode('customCss', e.target.value)}
                placeholder={`/* CSS properties for this node */\nbackground-color: #ffffff;\npadding: 8px 12px;\nborder-radius: 6px;\nfont-size: 14px;`}
                spellCheck={false}
              />
            </fieldset>
          </>
        ) : (
          /* Global Template CSS */
          <fieldset className="inspector-card">
            <legend>Global Template CSS Stylesheet</legend>
            <p className="text-muted small mb-2">
              All node rules, default styles, and global declarations in one unified stylesheet.
            </p>

            {/* Quick Global Snippet Buttons */}
            <div className="d-flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary"
                onClick={() => {
                  const s = '.report-page {\n  background-color: #f8fafc;\n}';
                  const existing = (template.globalCss || '').trim();
                  handleGlobalCssChange(existing ? `${existing}\n\n${s}` : s);
                }}
              >
                + Background
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary"
                onClick={() => {
                  const s = '.report-page {\n  font-family: Inter, Roboto, Arial, sans-serif;\n}';
                  const existing = (template.globalCss || '').trim();
                  handleGlobalCssChange(existing ? `${existing}\n\n${s}` : s);
                }}
              >
                + Font Family
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary"
                onClick={() => {
                  const s = '.report-section {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n}';
                  const existing = (template.globalCss || '').trim();
                  handleGlobalCssChange(existing ? `${existing}\n\n${s}` : s);
                }}
              >
                + Section Shadow
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary"
                onClick={() => {
                  const s = '.report-main-header {\n  background: linear-gradient(135deg, #0b3c83 0%, #1e3a8a 100%);\n}';
                  const existing = (template.globalCss || '').trim();
                  handleGlobalCssChange(existing ? `${existing}\n\n${s}` : s);
                }}
              >
                + Gradient Header
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary"
                onClick={() => {
                  const s = '@media print {\n  .report-page {\n    box-shadow: none !important;\n  }\n}';
                  const existing = (template.globalCss || '').trim();
                  handleGlobalCssChange(existing ? `${existing}\n\n${s}` : s);
                }}
              >
                + Print Reset
              </button>
            </div>

            <textarea
              className="form-control form-control-sm font-monospace node-css-textarea"
              rows={18}
              value={template.globalCss || ''}
              onChange={(e) => handleGlobalCssChange(e.target.value)}
              placeholder="/* Full Global Template CSS Stylesheet */"
              spellCheck={false}
            />
          </fieldset>
        )}
      </div>
    </aside>
  );
}
