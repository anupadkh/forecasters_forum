import React from 'react';

const SimpleEditableList = ({ items, onChange, renderItem }) => (
  <div>
    {items.map((it, idx) => (
      <div key={idx} className="d-flex align-items-start" style={{ marginBottom: 8 }}>
        <div style={{ flex: 1 }}>{renderItem(it, idx)}</div>
        <div className="ms-2">
          <button type="button" className="btn btn-sm btn-danger" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
            Remove
          </button>
        </div>
      </div>
    ))}
    <button type="button" className="btn btn-sm btn-primary mt-2" onClick={() => onChange([...items, {}])}>
      Add
    </button>
  </div>
);

export default SimpleEditableList;
