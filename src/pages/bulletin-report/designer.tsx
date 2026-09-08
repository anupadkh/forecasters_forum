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
  type SectionLayoutConfig,
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
  generateTemplateCss,
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
  const [previewWithDraft, setPreviewWithDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync currentTemplate whenever activeTemplateId changes
  useEffect(() => {
    const t =
      allTemplates.find((entry) => entry.id === activeTemplateId) ||
      allTemplates[0] ||
      (BUILTIN_TEMPLATES[0] as TemplateConfig);
    setCurrentTemplate(JSON.parse(JSON.stringify(t)));
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
        const next = { ...prev };
        const sec = next.sections[selectedSectionKey];
        if (!sec) return prev;
        const currentNode = sec.nodes[selectedNodeKey] || { id: '', className: '' };
        sec.nodes = {
          ...sec.nodes,
          [selectedNodeKey]: {
            ...currentNode,
            [field]: value,
          },
        };
        return next;
      });
    },
    [selectedSectionKey, selectedNodeKey]
  );

  const handleUpdateSectionLayout = useCallback(
    <K extends keyof SectionLayoutConfig>(field: K, value: SectionLayoutConfig[K]) => {
      setCurrentTemplate((prev) => {
        const next = { ...prev };
        const sec = next.sections[selectedSectionKey];
        if (!sec) return prev;
        sec.layout = {
          ...sec.layout,
          [field]: value,
        };
        return next;
      });
    },
    [selectedSectionKey]
  );

  const handleSelectNode = useCallback((sectionKey: SectionKey, nodeKey: string) => {
    setSelectedSectionKey(sectionKey);
    setSelectedNodeKey(nodeKey);
  }, []);

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

  return (
    <div className="designer-page-container">
      {/* Injected Live Template CSS */}
      <style id="designer-live-compiled-css">{compiledCss}</style>

      {/* Top Navigation & Action Header */}
      <header className="designer-header-bar">
        <div className="designer-title-group">
          <h1>Design Template Studio</h1>
          <p className="text-muted small mb-0">
            Customize IDs, classes, and node-level CSS rules for Bulletin sections
          </p>
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

          {!currentTemplate.isBuiltIn && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleDeleteCurrentTemplate}
            >
              🗑️ Delete
            </button>
          )}

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

      {/* Main Studio Body: 3-column modular layout */}
      <div className="designer-studio-workspace">
        {/* Left Column: Tree Explorer */}
        <TreeExplorer
          template={currentTemplate}
          selectedSectionKey={selectedSectionKey}
          selectedNodeKey={selectedNodeKey}
          onSelectNode={handleSelectNode}
        />

        {/* Center Column: Node Inspector & Style Controls */}
        <NodeInspector
          template={currentTemplate}
          selectedSectionKey={selectedSectionKey}
          selectedNodeKey={selectedNodeKey}
          onUpdateNode={handleUpdateNode}
          onUpdateSectionLayout={handleUpdateSectionLayout}
          onUpdateTemplate={setCurrentTemplate}
        />

        {/* Right Column: Live Interactive Preview */}
        <LivePreview
          template={currentTemplate}
          previewData={previewData}
          onSelectNode={handleSelectNode}
        />
      </div>
    </div>
  );
}
