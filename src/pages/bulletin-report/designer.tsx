import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Subcomponents
import TreeExplorer from './components/TreeExplorer';
import NodeInspector from './components/NodeInspector';
import LivePreview from './components/LivePreview';

// Modular types, presets, and storage functions
import {
  type SectionKey,
  type TemplateConfig,
  type NodeStyleConfig,
  TEMPLATES_STORAGE_KEY,
  ACTIVE_TEMPLATE_KEY,
  REPORT_SOURCE_KEY,
  DRAFT_KEY,
} from './types';
import { BUILTIN_TEMPLATES, SAMPLE_BULLETIN_DATA } from './templatePresets';
import {
  loadAllTemplates,
  saveTemplate,
  deleteTemplate,
  resetTemplateToBuiltin,
  resetAllTemplatesToDefault,
  generateTemplateCss,
  generateFullTemplateCss,
  updateCssBlockForId,
  updateCssIdSelector,
  syncGlobalCssToNodes,
} from './templateStore';

import './grid.css';

// Re-export all types, presets, and functions for other files (grid.tsx, List.jsx, tests)
export * from './types';
export * from './templatePresets';
export * from './templateStore';

export default function Designer() {
  const navigate = useNavigate();
  const [allTemplates, setAllTemplates] = useState<TemplateConfig[]>(loadAllTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_TEMPLATE_KEY) || 'standard';
  });

  const activeTemplate = useMemo(() => {
    return (
      allTemplates.find((t) => t.id === activeTemplateId) ||
      allTemplates[0] ||
      (BUILTIN_TEMPLATES[0] as TemplateConfig)
    );
  }, [allTemplates, activeTemplateId]);

  const [currentTemplate, setCurrentTemplate] = useState<TemplateConfig>(
    () => activeTemplate || (BUILTIN_TEMPLATES[0] as TemplateConfig)
  );
  const [selectedSectionKey, setSelectedSectionKey] = useState<SectionKey>('realized');
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('itemTitle');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState<'node' | 'global'>('node');
  const [previewWithDraft, setPreviewWithDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync currentTemplate whenever activeTemplateId changes
  useEffect(() => {
    const t =
      allTemplates.find((entry) => entry.id === activeTemplateId) ||
      allTemplates[0] ||
      (BUILTIN_TEMPLATES[0] as TemplateConfig);
    const cloned = JSON.parse(JSON.stringify(t)) as TemplateConfig;
    if (!cloned.globalCss || !cloned.globalCss.includes('#')) {
      cloned.globalCss = generateFullTemplateCss(cloned);
    }
    setCurrentTemplate(cloned);
  }, [activeTemplateId, allTemplates]);

  // Read draft data if requested
  const previewData = useMemo(() => {
    if (previewWithDraft) {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.meta || parsed.realized)) {
            return {
              meta: parsed.meta || SAMPLE_BULLETIN_DATA.meta,
              realized: parsed.realized?.length ? parsed.realized : SAMPLE_BULLETIN_DATA.realized,
              keyMessages: parsed.keyMessages?.length ? parsed.keyMessages : SAMPLE_BULLETIN_DATA.keyMessages,
              drivers: parsed.drivers?.length ? parsed.drivers : SAMPLE_BULLETIN_DATA.drivers,
              sevenDay: parsed.sevenDay?.length ? parsed.sevenDay : SAMPLE_BULLETIN_DATA.sevenDay,
              extended: parsed.extended?.length ? parsed.extended : SAMPLE_BULLETIN_DATA.extended,
              oceanWatch: parsed.oceanWatch?.length ? parsed.oceanWatch : SAMPLE_BULLETIN_DATA.oceanWatch,
              logos: parsed.logos?.length ? parsed.logos : SAMPLE_BULLETIN_DATA.logos,
            };
          }
        }
      } catch {
        // Fallback to sample
      }
    }
    return SAMPLE_BULLETIN_DATA;
  }, [previewWithDraft]);

  const compiledCss = useMemo(() => {
    return generateTemplateCss(currentTemplate);
  }, [currentTemplate]);

  const handleUpdateNode = useCallback(
    (field: keyof NodeStyleConfig, value: any) => {
      setCurrentTemplate((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as TemplateConfig;
        if (!next.globalCss || !next.globalCss.includes('#')) {
          next.globalCss = generateFullTemplateCss(next);
        }
        const sec = next.sections[selectedSectionKey];
        if (!sec) return prev;
        const currentNode = sec.nodes[selectedNodeKey] || { id: '', className: '', customCss: '' };
        const oldId = currentNode.id;
        sec.nodes[selectedNodeKey] = {
          ...currentNode,
          [field]: value,
        };

        // If ID changed, update selector in globalCss
        if (field === 'id') {
          const newId = String(value || '').trim();
          if (oldId && newId && oldId !== newId) {
            next.globalCss = updateCssIdSelector(next.globalCss, oldId, newId);
          }
        }

        // If customCss or hidden changed, update the CSS block in globalCss
        if (field === 'customCss' || field === 'hidden') {
          const targetId = sec.nodes[selectedNodeKey]?.id || selectedNodeKey;
          const newCss = field === 'customCss' ? value : sec.nodes[selectedNodeKey]?.customCss || '';
          const isHidden =
            field === 'hidden' ? Boolean(value) : Boolean(sec.nodes[selectedNodeKey]?.hidden);
          const fullBody = isHidden ? `display: none !important;\n${newCss}` : newCss;
          next.globalCss = updateCssBlockForId(next.globalCss, targetId, fullBody);
        }

        return next;
      });
    },
    [selectedSectionKey, selectedNodeKey]
  );

  const handleUpdateGlobalCss = useCallback((newGlobalCss: string) => {
    setCurrentTemplate((prev) => {
      const next = { ...prev, globalCss: newGlobalCss };
      next.sections = syncGlobalCssToNodes(newGlobalCss, next.sections);
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((sectionKey: SectionKey, nodeKey: string) => {
    setSelectedSectionKey(sectionKey);
    setSelectedNodeKey(nodeKey);
    setDrawerTab('node');
    setIsDrawerOpen(true);
  }, []);

  const handleOpenGlobalCss = useCallback(() => {
    if (isDrawerOpen && drawerTab === 'global') {
      setIsDrawerOpen(false);
    } else {
      setDrawerTab('global');
      setIsDrawerOpen(true);
    }
  }, [isDrawerOpen, drawerTab]);

  const handleOpenNodeCss = useCallback(() => {
    if (isDrawerOpen && drawerTab === 'node') {
      setIsDrawerOpen(false);
    } else {
      setDrawerTab('node');
      setIsDrawerOpen(true);
    }
  }, [isDrawerOpen, drawerTab]);

  const handleSaveCurrentTemplate = () => {
    setIsSaving(true);
    try {
      saveTemplate(currentTemplate);
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, currentTemplate.id);
      setAllTemplates(loadAllTemplates());
      toast.success(`Template "${currentTemplate.name}" saved successfully!`);
    } catch {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsNewTemplate = () => {
    const newName = window.prompt(
      'Enter name for the new template:',
      `${currentTemplate.name} (Copy)`
    );
    if (!newName || !newName.trim()) return;

    const newId = `custom-${Date.now()}`;
    const newT: TemplateConfig = {
      ...JSON.parse(JSON.stringify(currentTemplate)),
      id: newId,
      name: newName.trim(),
      isBuiltIn: false,
    };

    saveTemplate(newT);
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, newId);
    setAllTemplates(loadAllTemplates());
    setActiveTemplateId(newId);
    toast.success(`Created new template "${newT.name}"`);
  };

  const handleDeleteCurrentTemplate = () => {
    if (currentTemplate.isBuiltIn) {
      toast.warning('Built-in system templates cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete template "${currentTemplate.name}" permanently?`)) return;

    deleteTemplate(currentTemplate.id);
    const updated = loadAllTemplates();
    setAllTemplates(updated);
    const fallbackId = updated[0]?.id || 'standard';
    setActiveTemplateId(fallbackId);
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, fallbackId);
    toast.info('Template deleted');
  };

  const handleResetToBuiltin = () => {
    if (window.confirm(`Reset template "${currentTemplate.name}" back to original defaults?`)) {
      const reset =
        resetTemplateToBuiltin(currentTemplate.id) ||
        (BUILTIN_TEMPLATES[0] as TemplateConfig);
      setCurrentTemplate(JSON.parse(JSON.stringify(reset)));
      setAllTemplates(loadAllTemplates());
      toast.info('Template reset to default presets');
    }
  };

  return (
    <div className="designer-page-container">
      {/* Injected Live Template CSS */}
      <style id="designer-live-compiled-css">{compiledCss}</style>

      {/* Top Navigation & Action Header */}
      <header className="designer-header-bar">
        <div className="designer-title-group">
          <h1>Design Template Studio</h1>
          {/* <p className="text-muted small mb-0">
            Customize IDs, classes, and localized & global CSS rules for Bulletin sections
          </p> */}
        </div>

        <div className="designer-actions-toolbar">
          <div className="designer-template-selector">
            <label htmlFor="designer-active-template-select">Template:</label>
            <select
              id="designer-active-template-select"
              value={activeTemplateId}
              onChange={(e) => setActiveTemplateId(e.target.value)}
              className="form-select form-select-sm"
            >
              {allTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isBuiltIn ? '(Built-in)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="designer-name-input-group">
            <input
              type="text"
              className="form-control form-control-sm"
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
              placeholder="Template name"
              title="Edit template display name"
            />
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleSaveCurrentTemplate}
            disabled={isSaving}
          >
            💾 Save Template
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleSaveAsNewTemplate}
          >
            ➕ Save As New
          </button>

          {currentTemplate.isBuiltIn && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleResetToBuiltin}
              title="Reset this built-in template to its default styles"
            >
              ↺ Reset Defaults
            </button>
          )}

          {!currentTemplate.isBuiltIn && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleDeleteCurrentTemplate}
            >
              🗑️ Delete
            </button>
          )}

          {/* Direct Header Buttons for Node CSS & Global Template CSS */}
          <button
            type="button"
            className={`btn btn-sm ${
              isDrawerOpen && drawerTab === 'node' ? 'btn-primary' : 'btn-outline-primary'
            }`}
            onClick={handleOpenNodeCss}
            title="Open Localized Node CSS Editor"
          >
            🎨 Localized Node CSS
          </button>

          <button
            type="button"
            className={`btn btn-sm ${
              isDrawerOpen && drawerTab === 'global' ? 'btn-primary' : 'btn-outline-primary'
            }`}
            onClick={handleOpenGlobalCss}
            title="Open Global Template CSS Stylesheet"
          >
            🌐 Global Template CSS
          </button>

          <button
            type="button"
            className={`btn btn-sm ${previewWithDraft ? 'btn-info' : 'btn-outline-secondary'}`}
            onClick={() => setPreviewWithDraft(!previewWithDraft)}
            title="Toggle between sample data and your current draft"
          >
            {previewWithDraft ? '📄 Using Draft Data' : '✨ Using Sample Data'}
          </button>

          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={() => {
              saveTemplate(currentTemplate);
              localStorage.setItem(ACTIVE_TEMPLATE_KEY, currentTemplate.id);
              localStorage.setItem(
                REPORT_SOURCE_KEY,
                JSON.stringify({ templateId: currentTemplate.id })
              );
              navigate('/app/bulletin/report');
            }}
          >
            🚀 Open in Report View
          </button>
        </div>
      </header>

      {/* Main Studio Body: 2-column layout (Tree Explorer + Preview Area with Drawer) */}
      <div className="designer-studio-workspace">
        {/* Left Column: Tree Explorer */}
        <TreeExplorer
          template={currentTemplate}
          selectedSectionKey={selectedSectionKey}
          selectedNodeKey={selectedNodeKey}
          onSelectNode={handleSelectNode}
        />

        {/* Right Area: Preview Workspace with CSS Drawer immediately left of preview */}
        <div className="designer-preview-workspace-wrapper">
          {isDrawerOpen && (
            <NodeInspector
              template={currentTemplate}
              selectedSectionKey={selectedSectionKey}
              selectedNodeKey={selectedNodeKey}
              activeTab={drawerTab}
              onTabChange={setDrawerTab}
              onUpdateNode={handleUpdateNode}
              onUpdateGlobalCss={handleUpdateGlobalCss}
              onUpdateTemplate={setCurrentTemplate}
              onClose={() => setIsDrawerOpen(false)}
            />
          )}

          <LivePreview
            template={currentTemplate}
            previewData={previewData}
            onSelectNode={handleSelectNode}
          />
        </div>
      </div>
    </div>
  );
}
