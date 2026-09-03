import React from 'react';

const EditableList = ({ items, onChange, renderItem }) => {
  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const copy = [...items];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(copy);
  };

  return (
    <div>
      {items.map((it, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          <div className="d-flex align-items-start">
            <div style={{ flex: 1 }} className="p-2 border rounded" aria-label={`item-${idx}`}>
              {renderItem(it, idx)}
            </div>
            <div className="d-flex flex-column ms-2" style={{ minWidth: 72 }}>
              <button type="button" className="btn btn-sm btn-outline-secondary mb-1" onClick={() => move(idx, idx - 1)} disabled={idx === 0} aria-label="move-up">
                ↑
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary mb-1" onClick={() => move(idx, idx + 1)} disabled={idx === items.length - 1} aria-label="move-down">
                ↓
              </button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => onChange(items.filter((_, i) => i !== idx))} aria-label="remove">
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-primary mt-2" onClick={() => onChange([...items, {}])}>
        Add
      </button>
    </div>
  );
};

export default EditableList;
