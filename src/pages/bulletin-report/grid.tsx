import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GridLayout from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { useAtom } from 'jotai';
import { isEditingAtom } from '../../app/store/atoms';
import {
  loadAllTemplates,
  resetTemplateToBuiltin,
  generateTemplateCss,
  type TemplateConfig,
  type SectionKey,
  ALL_SECTION_KEYS,
  SECTION_NAMES,
  REPORT_SOURCE_KEY,
  DRAFT_KEY,
  ACTIVE_TEMPLATE_KEY,
  BUILTIN_TEMPLATES,
  SAMPLE_BULLETIN_DATA,
} from './designer';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './grid.css';

const A4_WIDTH_PX = 794;
const REPORT_COLUMNS = 4;
const REPORT_KEY_PREFIX = 'bulletin:report-layout:';

type ReportSection = {
  key: SectionKey;
  fallbackTitle: string;
  fallbackSubtitle: string;
  items: Array<Record<string, unknown>>;
};

type ReportLayoutItem = LayoutItem & { sectionKey: SectionKey };

const defaultLayout: ReportLayoutItem[] = [
  { i: 'realized', sectionKey: 'realized', x: 0, y: 0, w: 4, h: 3 },
  { i: 'keyMessages', sectionKey: 'keyMessages', x: 0, y: 3, w: 4, h: 3 },
  { i: 'drivers', sectionKey: 'drivers', x: 0, y: 6, w: 4, h: 3 },
  { i: 'sevenDay', sectionKey: 'sevenDay', x: 0, y: 9, w: 4, h: 3 },
  { i: 'extended', sectionKey: 'extended', x: 0, y: 12, w: 4, h: 3 },
  { i: 'oceanWatch', sectionKey: 'oceanWatch', x: 0, y: 15, w: 4, h: 3 },
  { i: 'logos', sectionKey: 'logos', x: 0, y: 18, w: 4, h: 2 },
];

const readJson = (key: string): Record<string, any> => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

const readReportData = (sourceKey?: string): Record<string, any> => {
  if (sourceKey && sourceKey !== DRAFT_KEY) {
    const fromSource = readJson(sourceKey);
    if (fromSource && Object.keys(fromSource).length > 0) return fromSource;
  }
  const draft = readJson(DRAFT_KEY);
  if (draft && Object.keys(draft).length > 0) return draft;
  const bulletins = Object.keys(localStorage)
    .filter((key) => key.startsWith('bulletin:') && key !== REPORT_SOURCE_KEY && !key.startsWith(REPORT_KEY_PREFIX))
    .map((key) => readJson(key))
    .filter((b): b is Record<string, any> => !!b && typeof b === 'object')
    .sort((left, right) => (right?.savedAt || 0) - (left?.savedAt || 0));

  const firstBulletin = bulletins[0];
  if (firstBulletin && Object.keys(firstBulletin).length > 0) {
    return firstBulletin;
  }
  return SAMPLE_BULLETIN_DATA as Record<string, any>;
};

const readReportLayout = (
  designTheme: string,
  reportId: string,
  bulletinData?: Record<string, any>
): ReportLayoutItem[] => {
  // 1. Specific key for this designTheme + reportId
  const specificKey = `${REPORT_KEY_PREFIX}${designTheme}:${reportId}`;
  const parsed = readJson(specificKey);
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  if (parsed && Array.isArray(parsed.layout) && parsed.layout.length > 0) return parsed.layout;

  // 2. Check if bulletin data carries layout for this theme
  if (bulletinData) {
    if (bulletinData.layoutByTheme && Array.isArray(bulletinData.layoutByTheme[designTheme]) && bulletinData.layoutByTheme[designTheme].length > 0) {
      return bulletinData.layoutByTheme[designTheme];
    }
    if (bulletinData.designTheme === designTheme && Array.isArray(bulletinData.layout) && bulletinData.layout.length > 0) {
      return bulletinData.layout;
    }
  }

  // 3. Fallback to latest saved layout for this design theme
  const templateLatest = readJson(`${REPORT_KEY_PREFIX}${designTheme}:latest`);
  if (Array.isArray(templateLatest) && templateLatest.length > 0) return templateLatest;
  if (templateLatest && Array.isArray(templateLatest.layout) && templateLatest.layout.length > 0) {
    return templateLatest.layout;
  }

  return defaultLayout;
};

const textFromItem = (item: Record<string, unknown>) => {
  const value = item.message || item.desc || item.text || item.title || '';
  return String(value).replace(/<[^>]*>/g, '').trim();
};

function ReportSectionCard({
  section,
  index,
  title,
  subtitle,
  template,
  isEditing,
  onMoveItem,
  onMoveNestedItem,
}: {
  section: ReportSection;
  index: number;
  title: string;
  subtitle: string;
  template: TemplateConfig;
  isEditing: boolean;
  onMoveItem: (from: number, to: number) => void;
  onMoveNestedItem: (groupIndex: number, from: number, to: number) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const secTemplate = template.sections[section.key];
  const rootNode = secTemplate?.nodes?.root;
  const headerNode = secTemplate?.nodes?.header;
  const titleNode = secTemplate?.nodes?.title;
  const subtitleNode = secTemplate?.nodes?.subtitle;
  const contentNode = secTemplate?.nodes?.content;
  const itemNode = secTemplate?.nodes?.item;
  const imgNode = secTemplate?.nodes?.image;
  const itemTitleNode = secTemplate?.nodes?.itemTitle;
  const itemDescNode = secTemplate?.nodes?.itemDesc;
  const groupNode = secTemplate?.nodes?.group;
  const groupTitleNode = secTemplate?.nodes?.groupTitle;

  const renderItem = (
    item: Record<string, unknown>,
    itemIndex: number,
    keyPrefix: string = String(section.key),
    moveItem: (from: number, to: number) => void = onMoveItem,
    itemCount: number = section.items.length
  ) => (
    <div
      id={itemNode?.id}
      className={`${itemNode?.className || ''} report-item`}
      data-section-key={section.key}
      data-item-index={itemIndex}
      key={`${keyPrefix}-${itemIndex}`}
      draggable={isEditing}
      onDragStart={() => setDraggedIndex(itemIndex)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggedIndex !== null && draggedIndex !== itemIndex) {
          moveItem(draggedIndex, itemIndex);
        }
        setDraggedIndex(null);
      }}
    >
      {section.key === 'logos' ? (
        <>
          {item.image || item.url || item.src ? (
            <img
              id={imgNode?.id}
              className={`${imgNode?.className || ''} report-item-img`}
              src={String(item.image || item.url || item.src)}
              alt={String(item.title || item.name || item.label || 'Logo')}
            />
          ) : null}
          {item.title || item.name || item.label ? (
            <span id={itemTitleNode?.id} className={itemTitleNode?.className}>
              {String(item.title || item.name || item.label)}
            </span>
          ) : null}
        </>
      ) : (
        <>
          {item.title || item.name ? (
            <h3 id={itemTitleNode?.id} className={itemTitleNode?.className}>
              {String(item.title || item.name)}
            </h3>
          ) : null}
          {item.image || item.url || item.src ? (
            <img
              id={imgNode?.id}
              className={`${imgNode?.className || ''} report-item-img`}
              src={String(item.image || item.url || item.src)}
              alt=""
            />
          ) : null}
          {textFromItem(item) ? (
            <p id={itemDescNode?.id} className={itemDescNode?.className}>
              {textFromItem(item)}
            </p>
          ) : null}
        </>
      )}
      {isEditing ? (
        <div className="item-order-controls print-controls" aria-label="Reorder item">
          <button
            type="button"
            aria-label="Move item up"
            onClick={() => moveItem(itemIndex, itemIndex - 1)}
            disabled={itemIndex === 0}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label="Move item down"
            onClick={() => moveItem(itemIndex, itemIndex + 1)}
            disabled={itemIndex === itemCount - 1}
          >
            ▼
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <article
      id={rootNode?.id || `report-section-${section.key}`}
      className={`${rootNode?.className || ''} report-section report-section-${section.key}`}
    >
      <header id={headerNode?.id} className={`${headerNode?.className || ''} report-section-header`}>
        <div className="report-section-title-row">
          <h2 id={titleNode?.id} className={titleNode?.className}>
            {title}
          </h2>
        </div>
        {subtitle ? (
          <p id={subtitleNode?.id} className={subtitleNode?.className}>
            {subtitle}
          </p>
        ) : null}
      </header>

      <div
        id={contentNode?.id}
        className={`${contentNode?.className || ''} report-items`}
      >
        {section.key === 'oceanWatch' ? (
          section.items.length ? (
            section.items.map((group, groupIndex) => {
              const children = Array.isArray(group.items)
                ? (group.items as Array<Record<string, unknown>>)
                : [];
              return (
                <div
                  id={groupNode?.id}
                  className={`${groupNode?.className || ''} report-ocean-group`}
                  data-section-key="oceanWatch"
                  data-group-index={groupIndex}
                  key={`ocean-group-${groupIndex}`}
                >
                  <h3 id={groupTitleNode?.id} className={groupTitleNode?.className}>
                    {String(group.title || 'Ocean conditions')}
                  </h3>
                  <div className="report-items">
                    {children.length ? (
                      children.map((child, childIndex) =>
                        renderItem(
                          child,
                          childIndex,
                          `ocean-${groupIndex}`,
                          (from, to) => onMoveNestedItem(groupIndex, from, to),
                          children.length
                        )
                      )
                    ) : (
                      <p className="report-empty">No content added.</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="report-empty">No content added.</p>
          )
        ) : section.key === 'extended' ? (
          section.items.length ? (
            section.items.map((group, groupIndex) => {
              const points = Array.isArray(group.points)
                ? (group.points as Array<Record<string, unknown>>)
                : [];
              return (
                <div
                  id={groupNode?.id}
                  className={`${groupNode?.className || ''} report-extended-group`}
                  data-section-key="extended"
                  data-group-index={groupIndex}
                  key={`extended-group-${groupIndex}`}
                >
                  <h3 id={groupTitleNode?.id} className={groupTitleNode?.className}>
                    {String(group.title || 'Outlook')}
                  </h3>
                  {group.image ? (
                    <img
                      id={imgNode?.id}
                      className={imgNode?.className}
                      src={String(group.image)}
                      alt=""
                    />
                  ) : null}
                  <div className="report-items">
                    {points.length ? (
                      points.map((point, pointIndex) =>
                        renderItem(
                          point,
                          pointIndex,
                          `extended-${groupIndex}`,
                          (from, to) => onMoveNestedItem(groupIndex, from, to),
                          points.length
                        )
                      )
                    ) : (
                      <p>{textFromItem(group) || 'No content added.'}</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="report-empty">No content added.</p>
          )
        ) : section.items.length ? (
          section.items.map((item, itemIndex) => renderItem(item, itemIndex))
        ) : (
          <p className="report-empty">No content added.</p>
        )}
      </div>
    </article>
  );
}

export default function Grid() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useAtom(isEditingAtom);
  const [allTemplates, setAllTemplates] = useState<TemplateConfig[]>(loadAllTemplates);

  const [selection] = useState(
    () => readJson(REPORT_SOURCE_KEY) as { sourceKey?: string; templateId?: string; reportId?: string; designTheme?: string }
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return selection.designTheme || selection.templateId || localStorage.getItem(ACTIVE_TEMPLATE_KEY) || 'standard';
  });

  // Always refresh templates on mount or template switch
  useEffect(() => {
    setAllTemplates(loadAllTemplates());
  }, [selectedTemplateId]);

  const activeTemplate: TemplateConfig = useMemo(() => {
    return (
      allTemplates.find((t) => t.id === selectedTemplateId) ||
      allTemplates[0] ||
      (BUILTIN_TEMPLATES[0] as TemplateConfig)
    );
  }, [allTemplates, selectedTemplateId]);

  const [data] = useState<Record<string, any>>(() => readReportData(selection.sourceKey));

  // Determine consistent report ID and design theme
  const reportId = useMemo(() => {
    if (selection.reportId) return selection.reportId;
    if (selection.sourceKey && selection.sourceKey !== DRAFT_KEY) {
      return selection.sourceKey;
    }
    if (data.id) return `bulletin:${data.id}`;
    if (data.meta?.date) {
      const sanitized = String(data.meta.date).trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-:]/g, '');
      if (sanitized) return `bulletin:${sanitized}`;
    }
    return 'bulletin:latest';
  }, [selection.reportId, selection.sourceKey, data]);

  const designTheme = selectedTemplateId;
  const reportLayoutKey = `${REPORT_KEY_PREFIX}${designTheme}:${reportId}`;

  const [layout, setLayout] = useState<ReportLayoutItem[]>(() =>
    readReportLayout(designTheme, reportId, data)
  );

  // Sync layout whenever active designTheme / template or reportId changes
  useEffect(() => {
    setLayout(readReportLayout(designTheme, reportId, data));
  }, [designTheme, reportId, data]);

  const [sectionItems, setSectionItems] = useState<Record<SectionKey, Array<Record<string, unknown>>>>(
    () =>
      Object.fromEntries(
        ALL_SECTION_KEYS.map((key) => [key, Array.isArray(data[key]) ? data[key] : []])
      ) as Record<SectionKey, Array<Record<string, unknown>>>
  );

  const sections: ReportSection[] = ALL_SECTION_KEYS.map((key) => ({
    key,
    fallbackTitle: SECTION_NAMES[key],
    fallbackSubtitle: '',
    items: sectionItems[key] || [],
  }));

  const sectionTitles: Record<string, string> = data.sectionTitles || {};
  const sectionSubtitles: Record<string, string> = data.sectionSubtitles || {};

  const compiledCss = useMemo(() => {
    return generateTemplateCss(activeTemplate);
  }, [activeTemplate]);

  // Saves resize & reposition of each grid element on grid change
  const handleLayoutChange = (newLayout: Layout) => {
    const next: ReportLayoutItem[] = newLayout.map((item) => {
      const match = defaultLayout.find((dl) => dl.i === item.i) || layout.find((l) => l.i === item.i);
      return {
        ...item,
        sectionKey: (match ? match.sectionKey : item.i) as SectionKey,
        minW: match?.minW ?? 1,
        minH: match?.minH ?? 1,
        maxW: match?.maxW ?? 4,
      };
    });
    setLayout(next);

    // Save with consistency: reportId and designTheme
    const layoutEnvelope = {
      reportId,
      designTheme,
      templateId: selectedTemplateId,
      layout: next,
      updatedAt: Date.now(),
    };

    localStorage.setItem(reportLayoutKey, JSON.stringify(layoutEnvelope));
    localStorage.setItem(`${REPORT_KEY_PREFIX}${designTheme}:latest`, JSON.stringify(layoutEnvelope));
  };

  const handleRevertToDefaultTemplate = () => {
    resetTemplateToBuiltin('standard');
    setAllTemplates(loadAllTemplates());
    setSelectedTemplateId('standard');
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, 'standard');
    localStorage.setItem(
      REPORT_SOURCE_KEY,
      JSON.stringify({ ...selection, reportId, designTheme: 'standard', templateId: 'standard' })
    );
    setLayout(defaultLayout);

    const layoutEnvelope = {
      reportId,
      designTheme: 'standard',
      templateId: 'standard',
      layout: defaultLayout,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`${REPORT_KEY_PREFIX}standard:${reportId}`, JSON.stringify(layoutEnvelope));
    toast.info('Reverted to default Standard template and layout');
  };

  const handleResetSectionPositions = () => {
    setLayout(defaultLayout);
    const layoutEnvelope = {
      reportId,
      designTheme,
      templateId: selectedTemplateId,
      layout: defaultLayout,
      updatedAt: Date.now(),
    };
    localStorage.setItem(reportLayoutKey, JSON.stringify(layoutEnvelope));
    toast.info('Grid layout reset to default');
  };

  const moveItem = (sectionKey: SectionKey, from: number, to: number) => {
    setSectionItems((previous) => {
      if (to < 0 || to >= previous[sectionKey].length) return previous;
      const items = [...previous[sectionKey]];
      const [item] = items.splice(from, 1);
      if (!item) return previous;
      items.splice(to, 0, item);
      const next = { ...previous, [sectionKey]: items };
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, [sectionKey]: items }));
      return next;
    });
  };

  const moveNestedItem = (
    sectionKey: SectionKey,
    groupIndex: number,
    field: 'items' | 'points',
    from: number,
    to: number
  ) => {
    setSectionItems((previous) => {
      const groups = [...previous[sectionKey]];
      const group = groups[groupIndex];
      if (!group || !Array.isArray(group[field]) || to < 0 || to >= (group[field] as any[]).length) {
        return previous;
      }
      const children = [...(group[field] as Array<Record<string, unknown>>)];
      const [child] = children.splice(from, 1);
      if (!child) return previous;
      children.splice(to, 0, child);
      groups[groupIndex] = { ...group, [field]: children };
      const next = { ...previous, [sectionKey]: groups };
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, [sectionKey]: groups }));
      return next;
    });
  };

  const handleEditInFormView = () => {
    const draftPayload = {
      ...data,
      ...sectionItems,
      sectionTitles,
      sectionSubtitles,
      driversTitle: sectionTitles.drivers,
      reportId,
      designTheme,
      templateId: selectedTemplateId,
      layout,
      sourceKey: selection.sourceKey || reportId,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
    navigate('/app/bulletin');
  };

  const [isSavingReport, setIsSavingReport] = useState(false);

  const handleSaveReport = () => {
    setIsSavingReport(true);
    try {
      // 1. Structure the layout envelope with reportId and designTheme
      const layoutEnvelope = {
        reportId,
        designTheme,
        templateId: selectedTemplateId,
        layout: layout.map((item) => ({
          i: item.i,
          sectionKey: item.sectionKey || item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          minW: item.minW ?? 1,
          minH: item.minH ?? 1,
          maxW: item.maxW ?? 4,
        })),
        updatedAt: Date.now(),
      };

      // 2. Save layout specifically for (designTheme, reportId)
      localStorage.setItem(reportLayoutKey, JSON.stringify(layoutEnvelope));

      // 3. Save as latest layout for this design theme
      localStorage.setItem(`${REPORT_KEY_PREFIX}${designTheme}:latest`, JSON.stringify(layoutEnvelope));

      // 4. Save active template
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, selectedTemplateId);

      // 5. Update REPORT_SOURCE_KEY with reportId and designTheme
      const updatedSelection = {
        ...selection,
        sourceKey: reportId,
        reportId,
        designTheme,
        templateId: selectedTemplateId,
      };
      localStorage.setItem(REPORT_SOURCE_KEY, JSON.stringify(updatedSelection));

      // 6. Update template mapping map
      try {
        const templateMapKey = 'bulletin:template-map';
        const currentMap = JSON.parse(localStorage.getItem(templateMapKey) || '{}');
        currentMap[reportId] = selectedTemplateId;
        if (selection.sourceKey) {
          currentMap[selection.sourceKey] = selectedTemplateId;
        }
        localStorage.setItem(templateMapKey, JSON.stringify(currentMap));
      } catch {
        // ignore
      }

      // 7. Update bulletin payload in storage with reportId, designTheme, and layout
      const updatedData = {
        ...data,
        ...sectionItems,
        sectionTitles,
        sectionSubtitles,
        reportId,
        designTheme,
        templateId: selectedTemplateId,
        layout: layoutEnvelope.layout,
        layoutByTheme: {
          ...(data.layoutByTheme || {}),
          [designTheme]: layoutEnvelope.layout,
        },
        savedAt: Date.now(),
      };

      if (reportId && reportId !== DRAFT_KEY) {
        localStorage.setItem(reportId, JSON.stringify(updatedData));
      }
      if (selection.sourceKey && selection.sourceKey !== reportId && selection.sourceKey !== DRAFT_KEY) {
        localStorage.setItem(selection.sourceKey, JSON.stringify(updatedData));
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedData));

      toast.success(`Report layout & theme "${activeTemplate.name}" saved for ${reportId}!`);
    } catch (err) {
      toast.error('Failed to save report configuration');
    } finally {
      setIsSavingReport(false);
    }
  };

  return (
    <>
      {/* Dynamic Template Stylesheet */}
      <style id="report-template-compiled-css">{compiledCss}</style>

      {/* Top Controls Toolbar */}
      <div className="print-controls report-toolbar" id="template-designer-toolbar">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleEditInFormView}
            title="Edit report contents using the form view"
          >
            ✏️ Edit Report (Form View)
          </button>

          <label className="fw-bold me-1 ms-2">Template:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: 180 }}
            value={selectedTemplateId}
            onChange={(e) => {
              const newTplId = e.target.value;
              setSelectedTemplateId(newTplId);
              localStorage.setItem(ACTIVE_TEMPLATE_KEY, newTplId);
              localStorage.setItem(
                REPORT_SOURCE_KEY,
                JSON.stringify({ ...selection, templateId: newTplId })
              );
            }}
          >
            {allTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={handleSaveReport}
            disabled={isSavingReport}
            title="Save report layout and template choice"
          >
            💾 Save Report
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              localStorage.setItem(ACTIVE_TEMPLATE_KEY, selectedTemplateId);
              navigate('/app/bulletin/designer');
            }}
          >
            🎨 Edit Template in Designer
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleRevertToDefaultTemplate}
            title="Revert to Standard built-in default template & layout"
          >
            ↺ Revert to Default Template
          </button>

          <button
            type="button"
            className={`btn btn-sm ${isEditing ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '🔒 Lock Layout' : '🔲 Resize & Reorder'}
          </button>

          {isEditing && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleResetSectionPositions}
              title="Reset section positions and sizes to default"
            >
              ↺ Reset Layout
            </button>
          )}

          <button type="button" className="btn btn-sm btn-success" onClick={() => window.print()}>
            🖨️ Print A4
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate('/app/bulletin/list')}
          >
            📋 Back to Bulletins
          </button>
        </div>
      </div>

      {/* A4 Report Canvas */}
      <main className="a4-print-area report-page" id="report-main-canvas">
        {/* Main Bulletin Header */}
        {(() => {
          const metaSec = activeTemplate.sections.metadata;
          return (
            <header
              id={metaSec?.nodes?.root?.id || 'report-main-header'}
              className={`${metaSec?.nodes?.root?.className || ''} report-main-header`}
            >
              <h1 id={metaSec?.nodes?.title?.id || 'report-main-title'} className={metaSec?.nodes?.title?.className}>
                {data.meta?.name || data.meta?.title || 'Weather & Climate Bulletin'}
              </h1>
              {data.meta?.subtitle ? (
                <p
                  id={metaSec?.nodes?.subtitle?.id || 'report-main-subtitle'}
                  className={metaSec?.nodes?.subtitle?.className}
                >
                  {data.meta.subtitle}
                </p>
              ) : null}
              {data.meta?.date ? (
                <time
                  id={metaSec?.nodes?.date?.id || 'report-main-date'}
                  className={metaSec?.nodes?.date?.className}
                  dateTime={data.meta.date}
                >
                  {data.meta.date}
                </time>
              ) : null}
            </header>
          );
        })()}

        {/* Resizable & Draggable Grid Layout */}
        <GridLayout
          className="layout"
          layout={layout}
          gridConfig={{ cols: REPORT_COLUMNS, rowHeight: 100, margin: [12, 12] }}
          width={A4_WIDTH_PX}
          dragConfig={{ enabled: isEditing }}
          resizeConfig={{ enabled: isEditing }}
          onLayoutChange={handleLayoutChange}
        >
          {layout.map((item) => {
            const section = sections.find((entry) => entry.key === item.sectionKey);
            if (!section || section.key === 'metadata') return null;
            const contentSections = sections.filter((s) => s.key !== 'metadata' && s.key !== 'logos');
            const itemIdx = contentSections.findIndex((s) => s.key === section.key);

            return (
              <div key={item.i} data-grid={item}>
                <ReportSectionCard
                  section={section}
                  index={itemIdx >= 0 ? itemIdx : 0}
                  title={sectionTitles[section.key] || section.fallbackTitle}
                  subtitle={sectionSubtitles[section.key] || section.fallbackSubtitle}
                  template={activeTemplate}
                  isEditing={isEditing}
                  onMoveItem={(from, to) => moveItem(section.key, from, to)}
                  onMoveNestedItem={(groupIndex, from, to) =>
                    moveNestedItem(
                      section.key,
                      groupIndex,
                      section.key === 'oceanWatch' ? 'items' : 'points',
                      from,
                      to
                    )
                  }
                />
              </div>
            );
          })}
        </GridLayout>
      </main>
    </>
  );
}
