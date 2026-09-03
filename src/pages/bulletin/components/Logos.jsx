import React from 'react';

const Logos = ({ images, logos, setLogos }) => (
  <section>
    <h3>Logos</h3>
    <div className="mb-2">
      <div className="d-flex flex-wrap gap-2">
        {images.map((img) => {
          const selected = logos.find((l) => l.url === img.url);
          return (
            <label key={img.id || img.url} className="d-flex align-items-center gap-2 p-1 border rounded" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={!!selected} onChange={(e) => { if (e.target.checked) setLogos([...logos, { name: img.label || img.url, url: img.url }]); else setLogos(logos.filter((l) => l.url !== img.url)); }} />
              <img src={img.url} alt={img.label} style={{ height: 30 }} />
            </label>
          );
        })}
      </div>
    </div>
    <div className="d-flex gap-2 flex-wrap">
      {logos.map((l, i) => (
        <div key={i} className="p-1 border rounded"><img src={l.url} alt={l.name} style={{ height: 40 }} /></div>
      ))}
    </div>
  </section>
);

export default Logos;
