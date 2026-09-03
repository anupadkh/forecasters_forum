import React from 'react';

const BulletinNavigator = ({ sections = [], openSection, onChange, onSave }) => (
  <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }} aria-label="Bulletin navigator">
    {sections.map((s) => (
      <button
        key={s.key}
        type="button"
        onClick={() => onChange(openSection === s.key ? null : s.key)}
        className={`btn btn-sm ${openSection === s.key ? 'btn-primary' : 'btn-outline-secondary'}`}
        aria-pressed={openSection === s.key}
      >
        {s.label}
      </button>
    ))}
    {onSave ? (
      <button type="button" className="btn btn-sm btn-success" onClick={onSave} aria-label="Save bulletin">
        Save
      </button>
    ) : null}
  </nav>
);

export default BulletinNavigator;
