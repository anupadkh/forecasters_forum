import React from 'react';

const SectionHeading = ({ sectionKey, title, subtitle, setTitle, setSubtitle }) => (
  <>
    <h3>{title}</h3>
    <div className="row g-2 mb-3">
      <div className="col-md-6">
        <label className="form-label" htmlFor={`${sectionKey}-title`}>Section title</label>
        <input
          id={`${sectionKey}-title`}
          className="form-control"
          value={title || ''}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label" htmlFor={`${sectionKey}-subtitle`}>Section subtitle</label>
        <input
          id={`${sectionKey}-subtitle`}
          className="form-control"
          value={subtitle || ''}
          onChange={(event) => setSubtitle(event.target.value)}
          placeholder="Add a subtitle"
        />
      </div>
    </div>
  </>
);

export default SectionHeading;
