import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { type SectionKey, type TemplateConfig, SECTION_NAMES } from '../types';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const A4_WIDTH_PX = 794;
const REPORT_COLUMNS = 4;
const REPORT_KEY_PREFIX = 'bulletin:report-layout:';

type ReportLayoutItem = LayoutItem & { sectionKey: SectionKey };

const DEFAULT_LAYOUT: ReportLayoutItem[] = [
  { i: 'realized', sectionKey: 'realized', x: 0, y: 0, w: 4, h: 3 },
  { i: 'keyMessages', sectionKey: 'keyMessages', x: 0, y: 3, w: 4, h: 3 },
  { i: 'drivers', sectionKey: 'drivers', x: 0, y: 6, w: 4, h: 3 },
  { i: 'sevenDay', sectionKey: 'sevenDay', x: 0, y: 9, w: 4, h: 3 },
  { i: 'extended', sectionKey: 'extended', x: 0, y: 12, w: 4, h: 3 },
  { i: 'oceanWatch', sectionKey: 'oceanWatch', x: 0, y: 15, w: 4, h: 3 },
  { i: 'logos', sectionKey: 'logos', x: 0, y: 18, w: 4, h: 2 },
];

const readLayout = (templateId: string): ReportLayoutItem[] => {
  try {
    const raw = localStorage.getItem(`${REPORT_KEY_PREFIX}${templateId}:latest`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed && Array.isArray(parsed.layout)) return parsed.layout;
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_LAYOUT;
};

type LivePreviewProps = {
  template: TemplateConfig;
  previewData: any;
  onSelectNode: (sectionKey: SectionKey, nodeKey: string) => void;
};

export default function LivePreview({
  template,
  previewData,
  onSelectNode,
}: LivePreviewProps) {
  const [layout, setLayout] = useState<ReportLayoutItem[]>(() => readLayout(template.id));
  const [isResizable, setIsResizable] = useState(true);

  // Sync layout when template changes
  useEffect(() => {
    setLayout(readLayout(template.id));
  }, [template.id]);

  const handleLayoutChange = (newLayout: Layout) => {
    const next: ReportLayoutItem[] = newLayout.map((item) => {
      const match = DEFAULT_LAYOUT.find((dl) => dl.i === item.i);
      return {
        ...item,
        sectionKey: (match ? match.sectionKey : item.i) as SectionKey,
      };
    });
    setLayout(next);
    try {
      localStorage.setItem(`${REPORT_KEY_PREFIX}${template.id}:latest`, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    try {
      localStorage.setItem(`${REPORT_KEY_PREFIX}${template.id}:latest`, JSON.stringify(DEFAULT_LAYOUT));
    } catch {
      // ignore
    }
  };

  return (
    <section className="designer-live-preview-panel">
      <div className="preview-header">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h3 className="mb-0">Live Interactive Preview</h3>
            <p className="text-muted small mb-0">
              Drag & resize sections on canvas. Click any item to edit styles in CSS Drawer.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-xs ${isResizable ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setIsResizable(!isResizable)}
              title="Toggle Resizing & Dragging Handles"
            >
              {isResizable ? '🔲 Resizing Enabled' : '🔒 Resizing Locked'}
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary"
              onClick={handleResetLayout}
              title="Reset Section Layout Positions to Defaults"
            >
              ↺ Reset Layout
            </button>
          </div>
        </div>
      </div>

      <div className="preview-canvas-wrapper">
        <div className="report-page a4-preview" id="report-canvas">
          {/* Metadata / Header */}
          {(() => {
            const sec = template.sections.metadata;
            const rootNode = sec?.nodes?.root;
            return (
              <header
                id={rootNode?.id}
                className={`${rootNode?.className || ''} report-main-header`}
                onClick={() => onSelectNode('metadata', 'root')}
              >
                <h1
                  id={sec?.nodes?.title?.id}
                  className={sec?.nodes?.title?.className}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode('metadata', 'title');
                  }}
                >
                  {previewData.meta.name || previewData.meta.title}
                </h1>
                {previewData.meta.subtitle && (
                  <p
                    id={sec?.nodes?.subtitle?.id}
                    className={sec?.nodes?.subtitle?.className}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode('metadata', 'subtitle');
                    }}
                  >
                    {previewData.meta.subtitle}
                  </p>
                )}
                {previewData.meta.date && (
                  <time
                    id={sec?.nodes?.date?.id}
                    className={sec?.nodes?.date?.className}
                    dateTime={previewData.meta.date}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode('metadata', 'date');
                    }}
                  >
                    {previewData.meta.date}
                  </time>
                )}
              </header>
            );
          })()}

          {/* Resizable & Draggable Sections Grid */}
          <GridLayout
            className="layout"
            layout={layout}
            gridConfig={{ cols: REPORT_COLUMNS, rowHeight: 90, margin: [12, 12] }}
            width={A4_WIDTH_PX}
            dragConfig={{ enabled: isResizable }}
            resizeConfig={{ enabled: isResizable }}
            onLayoutChange={handleLayoutChange}
          >
            {layout.map((item) => {
              const sectionKey = item.sectionKey;
              const sec = template.sections[sectionKey];
              if (!sec) return null;
              const root = sec.nodes.root;
              const header = sec.nodes.header;
              const title = sec.nodes.title;
              const subtitle = sec.nodes.subtitle;
              const content = sec.nodes.content;
              const itemNode = sec.nodes.item;
              const imgNode = sec.nodes.image;
              const itemTitleNode = sec.nodes.itemTitle;
              const itemDescNode = sec.nodes.itemDesc;

              const items = (previewData[sectionKey as keyof typeof previewData] || []) as Array<
                Record<string, any>
              >;

              return (
                <div key={item.i} data-grid={item} style={{ height: '100%' }}>
                  <article
                    id={root?.id}
                    className={`${root?.className || ''} report-section report-section-${sectionKey}`}
                    style={{ height: '100%', overflow: 'auto' }}
                    onClick={() => onSelectNode(sectionKey, 'root')}
                  >
                    <header
                      id={header?.id}
                      className={`${header?.className || ''} report-section-header`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNode(sectionKey, 'header');
                      }}
                    >
                      <div className="report-section-title-row">
                        <h2
                          id={title?.id}
                          className={title?.className}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectNode(sectionKey, 'title');
                          }}
                        >
                          {SECTION_NAMES[sectionKey]}
                        </h2>
                      </div>
                      <p
                        id={subtitle?.id}
                        className={subtitle?.className}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(sectionKey, 'subtitle');
                        }}
                      >
                        Regional summary & observations
                      </p>
                    </header>

                    <div
                      id={content?.id}
                      className={`${content?.className || ''} report-items`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNode(sectionKey, 'content');
                      }}
                    >
                      {sectionKey === 'oceanWatch' ? (
                        items.map((group, gIdx) => (
                          <div
                            key={gIdx}
                            id={sec.nodes.group?.id}
                            className={`${sec.nodes.group?.className || ''} report-ocean-group`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectNode('oceanWatch', 'group');
                            }}
                          >
                            <h3
                              id={sec.nodes.groupTitle?.id}
                              className={sec.nodes.groupTitle?.className}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNode('oceanWatch', 'groupTitle');
                              }}
                            >
                              {group.title || 'Ocean Conditions'}
                            </h3>
                            <div className="report-items">
                              {(group.items || []).map((subItem: any, sIdx: number) => {
                                  const subImg = subItem.image || subItem.url || subItem.src;
                                  return (
                                    <div
                                      key={sIdx}
                                      id={itemNode?.id}
                                      className={`${itemNode?.className || ''} report-item`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectNode('oceanWatch', 'item');
                                      }}
                                    >
                                      {subImg && (
                                        <img
                                          id={imgNode?.id}
                                          className={imgNode?.className}
                                          src={subImg}
                                          alt=""
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectNode('oceanWatch', 'image');
                                          }}
                                        />
                                      )}
                                      <p
                                        id={itemDescNode?.id}
                                        className={itemDescNode?.className}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectNode('oceanWatch', 'itemDesc');
                                        }}
                                      >
                                        {subItem.desc || subItem.message || 'Observed conditions'}
                                      </p>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))
                      ) : sectionKey === 'extended' ? (
                        items.map((group, gIdx) => {
                          const grpImg = group.image || group.url || group.src;
                          return (
                            <div
                              key={gIdx}
                              id={sec.nodes.group?.id}
                              className={`${sec.nodes.group?.className || ''} report-extended-group`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNode('extended', 'group');
                              }}
                            >
                              <h3
                                id={sec.nodes.groupTitle?.id}
                                className={sec.nodes.groupTitle?.className}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectNode('extended', 'groupTitle');
                                }}
                              >
                                {group.title || group.name || 'Extended Outlook'}
                              </h3>
                              {grpImg && (
                                <img
                                  id={imgNode?.id}
                                  className={imgNode?.className}
                                  src={grpImg}
                                  alt=""
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectNode('extended', 'image');
                                  }}
                                />
                              )}
                              <ul className="mb-0 ps-3">
                                {(group.points || []).map((pt: any, pIdx: number) => (
                                  <li
                                    key={pIdx}
                                    id={itemDescNode?.id}
                                    className={itemDescNode?.className}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectNode('extended', 'itemDesc');
                                    }}
                                  >
                                    {pt.text || pt.message || pt.desc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })
                      ) : sectionKey === 'logos' ? (
                        items.map((it, itemIdx) => {
                          const logoImg = it.image || it.url || it.src;
                          const logoTitle = it.title || it.name || it.label;
                          return (
                            <div
                              key={itemIdx}
                              id={itemNode?.id}
                              className={`${itemNode?.className || ''} report-item`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNode(sectionKey, 'item');
                              }}
                            >
                              {logoImg && (
                                <img
                                  id={imgNode?.id}
                                  className={imgNode?.className}
                                  src={logoImg}
                                  alt={logoTitle || 'Logo'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectNode(sectionKey, 'image');
                                  }}
                                />
                              )}
                              {logoTitle && (
                                <span
                                  id={itemTitleNode?.id}
                                  className={itemTitleNode?.className}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectNode(sectionKey, 'itemTitle');
                                  }}
                                >
                                  {logoTitle}
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        items.map((it, itemIdx) => {
                          const itemImg = it.image || it.url || it.src;
                          const itemTitle = it.title || it.name || it.label;
                          const itemText = it.desc || it.message || it.text;
                          return (
                            <div
                              key={itemIdx}
                              id={itemNode?.id}
                              className={`${itemNode?.className || ''} report-item`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNode(sectionKey, 'item');
                              }}
                            >
                              {itemTitle && (
                                <h3
                                  id={itemTitleNode?.id}
                                  className={itemTitleNode?.className}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectNode(sectionKey, 'itemTitle');
                                  }}
                                >
                                  {itemTitle}
                                </h3>
                              )}
                              {itemImg && (
                                <img
                                  id={imgNode?.id}
                                  className={imgNode?.className}
                                  src={itemImg}
                                  alt=""
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectNode(sectionKey, 'image');
                                  }}
                                />
                              )}
                              {itemText && (
                                <p
                                  id={itemDescNode?.id}
                                  className={itemDescNode?.className}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectNode(sectionKey, 'itemDesc');
                                  }}
                                >
                                  {itemText}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
          </GridLayout>
        </div>
      </div>
    </section>
  );
}
