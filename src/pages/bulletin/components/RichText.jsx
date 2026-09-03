import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Editor, EditorState, ContentState, convertFromHTML, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';

const INLINE_STYLES = [
  { label: 'B', style: 'BOLD' },
  { label: 'I', style: 'ITALIC' },
  { label: 'U', style: 'UNDERLINE' },
];

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: '• List', style: 'unordered-list-item' },
  { label: '1. List', style: 'ordered-list-item' },
  { label: '"', style: 'blockquote' },
];

// Memoized to prevent re-renders on every keystroke in the editor
const ToolbarButton = React.memo(({ active, onToggle, label, styleType }) => (
  <button
    type="button"
    onMouseDown={(e) => { 
      e.preventDefault(); 
      onToggle(styleType); 
    }}
    className={`btn btn-sm me-1 ${active ? 'btn-primary' : 'btn-outline-secondary'}`}
    style={{ padding: '0.25rem 0.5rem', minWidth: 34 }}
  >
    {label}
  </button>
));

const RichText = ({ value = '', onChange, placeholder = 'Enter description...', style = {} }) => {
  const lastSentHtml = useRef(value);
  const editorRef = useRef(null);
  const changeTimer = useRef(null);

  // Lazily initialize state to prevent double-renders on mount
  const [editorState, setEditorState] = useState(() => {
    if (value) {
      try {
        const blocks = convertFromHTML(value);
        const content = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
        return EditorState.createWithContent(content);
      } catch (err) {
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  // 1. Sync external value to internal state (only if changed externally)
  useEffect(() => {
    // Short-circuit: If the incoming value is what we just generated, do nothing.
    if (value === lastSentHtml.current) return;

    if (!value) {
      setEditorState(EditorState.createEmpty());
      lastSentHtml.current = '';
      return;
    }

    try {
      const blocks = convertFromHTML(value);
      const content = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
      setEditorState(EditorState.createWithContent(content));
      lastSentHtml.current = value;
    } catch (err) {
      // ignore conversion errors
    }
  }, [value]);

  // 2. Sync internal state to external onChange (Debounced)
  useEffect(() => {
    if (changeTimer.current) clearTimeout(changeTimer.current);
    
    changeTimer.current = setTimeout(() => {
      try {
        const html = stateToHTML(editorState.getCurrentContent());
        if (onChange && html !== lastSentHtml.current) {
          lastSentHtml.current = html;
          onChange(html);
        }
      } catch (err) {
        // ignore
      }
    }, 300);

    return () => { 
      if (changeTimer.current) clearTimeout(changeTimer.current); 
    };
  }, [editorState, onChange]);

  const toggleInline = useCallback((inlineStyle) => {
    setEditorState((prev) => RichUtils.toggleInlineStyle(prev, inlineStyle));
  }, []);

  const toggleBlock = useCallback((block) => {
    setEditorState((prev) => RichUtils.toggleBlockType(prev, block));
  }, []);

  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  // Derive current styles for toolbar UI
  const currentStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  let blockType = 'unstyled';
  
  if (selection.getHasFocus() || selection.getStartKey()) {
    try {
      blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();
    } catch (err) {
      // ignore
    }
  }

  return (
    <div style={{ minHeight: 140, border: '1px solid #ddd', padding: 8, borderRadius: 4, overflow: 'auto', direction: 'ltr', ...style }}>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {INLINE_STYLES.map((s) => (
          <ToolbarButton 
            key={s.style} 
            label={s.label} 
            styleType={s.style}
            active={currentStyle.has(s.style)} 
            onToggle={toggleInline} 
          />
        ))}
        {BLOCK_TYPES.map((b) => (
          <ToolbarButton 
            key={b.style} 
            label={b.label}
            styleType={b.style} 
            active={blockType === b.style} 
            onToggle={toggleBlock} 
          />
        ))}
      </div>

      <div onClick={focusEditor} style={{ cursor: 'text', minHeight: 100 }}>
        <Editor 
          ref={editorRef} 
          editorState={editorState} 
          onChange={setEditorState} 
          placeholder={placeholder} 
        />
      </div>
    </div>
  );
};

export default RichText;