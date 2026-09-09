import React from 'react';
import { type SectionKey, type TemplateConfig, SECTION_NAMES } from '../types';

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
  return (
    <section className="designer-live-preview-panel">
      <div className="preview-header">
        <div className="d-flex align-items-center justify-content-between">
          <h3>Live Interactive Preview</h3>
          <span className="badge bg-success">Interactive Click-to-Select</span>
        </div>
        <p className="text-muted small mb-0">
          Click on any item in the preview to immediately select its node for editing.
        </p>
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

          {/* Sections Grid Rendering */}
          <div className="designer-preview-sections-grid">
            {(
              [
                'realized',
                'keyMessages',
                'drivers',
                'sevenDay',
                'extended',
                'oceanWatch',
                'logos',
              ] as SectionKey[]
            ).map((sectionKey, idx) => {
              const sec = template.sections[sectionKey];
              if (!sec) return null;
              const layout = sec.layout;
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
                <article
                  key={sectionKey}
                  id={root?.id}
                  className={`${root?.className || ''} report-section report-section-${sectionKey}`}
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
                        {layout.numbered ? `${idx + 1}. ` : ''}
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
                    className={`${content?.className || ''} report-items report-items-${layout.direction}`}
                    style={
                      {
                        '--report-columns': layout.columns,
                        '--report-grid-template-columns': layout.columnWidths || undefined,
                        gridTemplateColumns: layout.columnWidths || undefined,
                      } as React.CSSProperties
                    }
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
                          <div
                            className={`report-items report-items-${layout.direction}`}
                            style={
                              {
                                '--report-columns': layout.columns,
                                '--report-grid-template-columns': layout.columnWidths || undefined,
                                gridTemplateColumns: layout.columnWidths || undefined,
                              } as React.CSSProperties
                            }
                          >
                            {(group.items || []).map((subItem: any, sIdx: number) => (
                              <div
                                key={sIdx}
                                id={itemNode?.id}
                                className={`${itemNode?.className || ''} report-item report-item-${layout.direction}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectNode('oceanWatch', 'item');
                                }}
                              >
                                {subItem.image && (
                                  <img
                                    id={imgNode?.id}
                                    className={imgNode?.className}
                                    src={subItem.image}
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
                                  {subItem.desc || 'Observed conditions'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : sectionKey === 'extended' ? (
                      items.map((group, gIdx) => (
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
                            {group.title || 'Extended Outlook'}
                          </h3>
                          {group.image && (
                            <img
                              id={imgNode?.id}
                              className={imgNode?.className}
                              src={group.image}
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
                                {pt.text || pt.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      items.map((it, itemIdx) => (
                        <div
                          key={itemIdx}
                          id={itemNode?.id}
                          className={`${itemNode?.className || ''} report-item report-item-${layout.direction}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectNode(sectionKey, 'item');
                          }}
                        >
                          {it.image && (
                            <img
                              id={imgNode?.id}
                              className={imgNode?.className}
                              src={it.image}
                              alt=""
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNode(sectionKey, 'image');
                              }}
                            />
                          )}
                          <div className="report-item-content">
                            {it.title && (
                              <h3
                                id={itemTitleNode?.id}
                                className={itemTitleNode?.className}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectNode(sectionKey, 'itemTitle');
                                }}
                              >
                                {it.title}
                              </h3>
                            )}
                            <p
                              id={itemDescNode?.id}
                              className={itemDescNode?.className}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNode(sectionKey, 'itemDesc');
                              }}
                            >
                              {it.desc || it.message || 'Sample bulletin item content'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
