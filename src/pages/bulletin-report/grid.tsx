import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { useAtom } from 'jotai';
import { isEditingAtom } from '../../app/store/atoms';
import {
  loadAllTemplates,
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
  { i: 'realized', sectionKey: 'realized', x: 0, y: 0, w: 2, h: 3 },
  { i: 'keyMessages', sectionKey: 'keyMessages', x: 2, y: 0, w: 2, h: 3 },
  { i: 'drivers', sectionKey: 'drivers', x: 0, y: 3, w: 2, h: 3 },
  { i: 'sevenDay', sectionKey: 'sevenDay', x: 2, y: 3, w: 2, h: 3 },
  { i: 'extended', sectionKey: 'extended', x: 0, y: 6, w: 2, h: 3 },
  { i: 'oceanWatch', sectionKey: 'oceanWatch', x: 2, y: 6, w: 2, h: 3 },
  { i: 'logos', sectionKey: 'logos', x: 0, y: 9, w: 4, h: 2 },
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
  if (sourceKey) {
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

const readReportLayout = (reportKey: string): ReportLayoutItem[] => {
  const parsed = readJson(reportKey);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.layout)) return parsed.layout;
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
  const layout = secTemplate?.layout || {
    contentType: 'title-image-description',
    direction: 'column',
    columns: 2,
    showSubtitle: true,
    numbered: true,
  };

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
      id={itemNode?.id ? `${itemNode.id}-${itemIndex}` : `report-item-${section.key}-${itemIndex}`}
      className={`${itemNode?.className || ''} report-item report-item-${layout.direction}`}
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
      {item.image ? (
        <img
          id={imgNode?.id}
          className={`${imgNode?.className || ''} report-item-img`}
          src={String(item.image)}
          alt=""
        />
      ) : null}
      <div className="report-item-content">
        {item.title ? (
          <h3 id={itemTitleNode?.id} className={itemTitleNode?.className}>
            {String(item.title)}
          </h3>
        ) : null}
        <p id={itemDescNode?.id} className={itemDescNode?.className}>
          {textFromItem(item) || 'No content added.'}
        </p>
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
            {layout.numbered ? `${index + 1}. ` : ''}
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
        className={`${contentNode?.className || ''} report-items report-items-${layout.direction}`}
        style={
          {
            '--report-columns': layout.columns,
            '--report-grid-template-columns': layout.columnWidths || undefined,
            gridTemplateColumns: layout.columnWidths || undefined,
          } as React.CSSProperties
        }
      >
        {section.key === 'oceanWatch' ? (
          section.items.length ? (
            section.items.map((group, groupIndex) => {
              const children = Array.isArray(group.items)
                ? (group.items as Array<Record<string, unknown>>)
                : [];
              return (
                <div
                  id={groupNode?.id ? `${groupNode.id}-${groupIndex}` : `report-ocean-group-${groupIndex}`}
                  className={`${groupNode?.className || ''} report-ocean-group`}
                  data-section-key="oceanWatch"
                  data-group-index={groupIndex}
                  key={`ocean-group-${groupIndex}`}
                >
                  <h3 id={groupTitleNode?.id} className={groupTitleNode?.className}>
                    {String(group.title || 'Ocean conditions')}
                  </h3>
                  <div
                    className={`report-items report-items-${layout.direction} report-items-ocean-${groupIndex}`}
                    style={
                      {
                        '--report-columns': layout.columns,
                        '--report-grid-template-columns': layout.columnWidths || undefined,
                        gridTemplateColumns: layout.columnWidths || undefined,
                      } as React.CSSProperties
                    }
                  >
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
                  id={groupNode?.id ? `${groupNode.id}-${groupIndex}` : `report-extended-group-${groupIndex}`}
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
                  <div className={`report-items report-items-${layout.direction}`}>
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
  const [allTemplates] = useState<TemplateConfig[]>(loadAllTemplates);

  const [selection] = useState(
    () => readJson(REPORT_SOURCE_KEY) as { sourceKey?: string; templateId?: string }
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return selection.templateId || localStorage.getItem(ACTIVE_TEMPLATE_KEY) || 'standard';
  });

  const activeTemplate: TemplateConfig = useMemo(() => {
    return (
      allTemplates.find((t) => t.id === selectedTemplateId) ||
      allTemplates[0] ||
      (BUILTIN_TEMPLATES[0] as TemplateConfig)
    );
  }, [allTemplates, selectedTemplateId]);

  const reportLayoutKey = `${REPORT_KEY_PREFIX}${selectedTemplateId}:${selection.sourceKey || 'latest'}`;
  const [data] = useState<Record<string, any>>(() => readReportData(selection.sourceKey));
  const [layout, setLayout] = useState<ReportLayoutItem[]>(() => readReportLayout(reportLayoutKey));

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

  const handleLayoutChange = (newLayout: Layout) => {
    const next: ReportLayoutItem[] = newLayout.map((item) => {
      const match = defaultLayout.find((dl) => dl.i === item.i);
      return {
        ...item,
        sectionKey: (match ? match.sectionKey : item.i) as SectionKey,
      };
    });
    setLayout(next);
    localStorage.setItem(reportLayoutKey, JSON.stringify(next));
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

  return (
    <>
      {/* Dynamic Template Stylesheet */}
      <style id="report-template-compiled-css">{compiledCss}</style>

      {/* Top Controls Toolbar */}
      <div className="print-controls report-toolbar" id="template-designer-toolbar">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <label className="fw-bold me-1">Template:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: 200 }}
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              localStorage.setItem(ACTIVE_TEMPLATE_KEY, e.target.value);
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
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              localStorage.setItem(ACTIVE_TEMPLATE_KEY, selectedTemplateId);
              navigate('/app/bulletin/designer');
            }}
          >
            🎨 Edit Template CSS & Nodes
          </button>

          <button
            type="button"
            className={`btn btn-sm ${isEditing ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '🔒 Lock Layout' : '🔲 Resize & Reorder'}
          </button>

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
            const itemIdx = sections.indexOf(section);

            return (
              <div key={item.i} data-grid={item}>
                <ReportSectionCard
                  section={section}
                  index={itemIdx}
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
