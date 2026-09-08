import React, { useState } from 'react';
import {
  type SectionKey,
  type TemplateConfig,
  type TreeNodeDef,
  ALL_SECTION_KEYS,
  SECTION_NAMES,
  SECTION_TREE_HIERARCHIES,
} from '../types';

type TreeExplorerProps = {
  template: TemplateConfig;
  selectedSectionKey: SectionKey;
  selectedNodeKey: string;
  onSelectNode: (sectionKey: SectionKey, nodeKey: string) => void;
};

export default function TreeExplorer({
  template,
  selectedSectionKey,
  selectedNodeKey,
  onSelectNode,
}: TreeExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const renderTreeNode = (
    sectionKey: SectionKey,
    nodeDef: TreeNodeDef,
    secNodes: Record<string, any>,
    isSectionSelected: boolean,
    depth: number = 0,
    isLast: boolean = true
  ) => {
    const nodeKey = nodeDef.key;
    const nodeConfig = secNodes[nodeKey];
    const isNodeSelected = isSectionSelected && selectedNodeKey === nodeKey;
    const hasChildren = Boolean(nodeDef.children && nodeDef.children.length > 0);
    const isHidden = Boolean(nodeConfig?.hidden);

    const tooltipText = [
      `${nodeDef.label} (${nodeDef.tag || 'element'})`,
      `ID: ${nodeConfig?.id ? `#${nodeConfig.id}` : '(none)'}`,
      `Class: ${nodeConfig?.className ? `.${nodeConfig.className}` : '(none)'}`,
      `Status: ${isHidden ? 'Hidden from report' : 'Visible in report'}`,
      'Click to edit identity & styles',
    ].join('\n');

    return (
      <div
        key={`${sectionKey}-${nodeKey}-${depth}`}
        className={`tree-hierarchy-node depth-${depth} ${hasChildren ? 'has-children' : 'leaf-node'} ${
          isNodeSelected ? 'is-selected' : ''
        } ${isHidden ? 'is-node-hidden' : ''}`}
      >
        <div
          className={`tree-node-row ${isNodeSelected ? 'active-node' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectNode(sectionKey, nodeKey);
          }}
          title={tooltipText}
        >
          <div className="tree-node-col-main">
            <span className="tree-branch-indicator">{depth > 0 ? (isLast ? '└──' : '├──') : '•'}</span>
            <div className="node-info-text">
              <span className="node-display-label">{nodeDef.label}</span>
              {nodeDef.tag && <span className="node-tag-badge">{nodeDef.tag}</span>}
              {isHidden && <span className="node-hidden-badge">Hidden</span>}
            </div>
          </div>
        </div>

        {hasChildren && (
          <div className="tree-children-container">
            {nodeDef.children!.map((childDef, childIdx) =>
              renderTreeNode(
                sectionKey,
                childDef,
                secNodes,
                isSectionSelected,
                depth + 1,
                childIdx === nodeDef.children!.length - 1
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="designer-tree-explorer">
      <div className="tree-explorer-header">
        <h2>Bulletin Sections & Tree Nodes</h2>
        <input
          type="search"
          className="form-control form-control-sm"
          placeholder="Search sections or nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="tree-sections-list">
        {ALL_SECTION_KEYS.filter(
          (key) =>
            SECTION_NAMES[key].toLowerCase().includes(searchQuery.toLowerCase()) ||
            key.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((sectionKey) => {
          const isSectionSelected = selectedSectionKey === sectionKey;
          const secNodes = template.sections[sectionKey]?.nodes || {};
          const hierarchy = SECTION_TREE_HIERARCHIES[sectionKey];
          const rootNode = secNodes.root;
          const sectionTooltip = [
            SECTION_NAMES[sectionKey],
            `Root ID: ${rootNode?.id ? `#${rootNode.id}` : '(none)'}`,
            `Root Class: ${rootNode?.className ? `.${rootNode.className}` : '(none)'}`,
          ].join('\n');

          return (
            <div
              key={sectionKey}
              className={`tree-section-item ${isSectionSelected ? 'selected' : ''}`}
            >
              <div
                className="tree-section-title"
                title={sectionTooltip}
                onClick={() => {
                  const targetNodeKey = secNodes[selectedNodeKey] ? selectedNodeKey : 'root';
                  onSelectNode(sectionKey, targetNodeKey);
                }}
              >
                <span className="section-dot" />
                <strong>{SECTION_NAMES[sectionKey]}</strong>
                <span className="section-toggle-badge">
                  {isSectionSelected ? '▼' : '▶'}
                </span>
              </div>

              {isSectionSelected && (
                <div className="tree-section-branch-root">
                  {renderTreeNode(sectionKey, hierarchy, secNodes, isSectionSelected, 0, true)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
