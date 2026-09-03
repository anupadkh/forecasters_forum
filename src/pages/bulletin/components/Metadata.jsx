import React from 'react';

const Metadata = ({ meta, setMeta }) => (
  <section>
    <h3>Metadata</h3>
    <div className="row g-2">
        <div className="col-md-12">
            <label className="form-label">Bulletin name</label>
            <input className="form-control" value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} style={{ fontSize: '2rem', fontWeight: 700 }} />
        </div>
      <div className="col-md-6">
        <label className="form-label">Title</label>
        <input className="form-control" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} style={{ fontWeight: 700 }} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Subtitle</label>
        <input className="form-control" value={meta.subtitle} onChange={(e) => setMeta({ ...meta, subtitle: e.target.value })} style={{ fontStyle: 'italic' }} />
      </div>
      <div className="col-md-2">
        <label className="form-label">Date</label>
        <input type="date" className="form-control" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
      </div>
      
      
    </div>
  </section>
);

export default Metadata;
