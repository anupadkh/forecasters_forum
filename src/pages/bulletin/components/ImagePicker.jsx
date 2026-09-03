import React, { useState, useEffect, useRef } from 'react';
import { getImages } from '../../../services/imageService';

const ImagePicker = ({ images = [], value, onChange, size = 60, placeholder = 'Choose image...', section }) => {
  const [open, setOpen] = useState(false);
  const [localImages, setLocalImages] = useState(images || []);
  const selected = (localImages || images).find((img) => img.url === value) || null;

  useEffect(() => {
    let mounted = true;
    if (section) {
      getImages(section).then((list) => { if (mounted) setLocalImages(list); }).catch(() => { if (mounted) setLocalImages(images || []); });
    } else {
      setLocalImages(images || []);
    }
    return () => { mounted = false; };
  }, [section, images]);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleDocClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [open]);

  return (
    <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setOpen((v) => !v)}>
          {selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <img src={selected.url} alt="sel" style={{ height: size, width: size, objectFit: 'cover', display: 'block' }} />
              <span style={{ fontSize: 12 }}>{selected.label}</span>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
        </button>

        {open ? (
          <div className="card" style={{ position: 'absolute', zIndex: 1200, marginTop: 6, maxHeight: 260, overflow: 'auto' }}>
            <div className="list-group list-group-flush">
              {(localImages || []).map((img) => (
                <button key={img.id || img.url} type="button" className="list-group-item list-group-item-action d-flex align-items-center" onClick={() => { onChange(img.url); setOpen(false); }}>
                  <img src={img.url} alt={img.label} style={{ height: size - 12, objectFit: 'cover', marginRight: 8 }} />
                  <div>{img.label}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* {value ? <img src={value} alt="preview" style={{ height: size, objectFit: 'cover' }} /> : null} */}
    </div>
  );
};

export default ImagePicker;
