import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import s from './Bulletin.module.scss';

const STORAGE_PREFIX = 'bulletin:';
const DRAFT_KEY = 'bulletin:draft';

const List = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
    const list = keys.map((k) => {
      try {
        return { key: k, payload: JSON.parse(localStorage.getItem(k)) };
      } catch (err) {
        return { key: k, payload: null };
      }
    });
    setItems(list);
  }, []);

  const reload = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
    const list = keys.map((k) => {
      try {
        return { key: k, payload: JSON.parse(localStorage.getItem(k)) };
      } catch (err) {
        return { key: k, payload: null };
      }
    });
    setItems(list);
  };

  const handleLoad = (key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    localStorage.setItem(DRAFT_KEY, raw);
    navigate('/app/bulletin');
  };

  const handleDelete = (key) => {
    // confirm before deleting
    if (!window.confirm('Delete this bulletin permanently?')) return;
    localStorage.removeItem(key);
    if (key === DRAFT_KEY) {
      localStorage.removeItem(DRAFT_KEY);
    }
    reload();
  };

  const handleNew = () => {
    localStorage.removeItem(DRAFT_KEY);
    navigate('/app/bulletin');
  };

  return (
    <div className={s.root}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Bulletins</h1>
        <div>
          <button className="btn btn-primary me-2" onClick={handleNew}>Create Bulletin</button>
          {/* <Link className="btn btn-outline-secondary" to="/app/bulletin">Open Create</Link> */}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info">No saved bulletins found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Key</th>
                <th>Name / Title</th>
                <th>Date</th>
                <th>Subtitle</th>
                <th>Saved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const meta = it.payload && it.payload.meta;
                const name = (meta && (meta.name || meta.title)) || '';
                const date = (meta && meta.date) || (it.payload && it.payload.savedAt ? new Date(it.payload.savedAt).toLocaleString() : '');
                const subtitle = (meta && meta.subtitle) || '';

                return (
                  <tr key={it.key}>
                    <td style={{ maxWidth: 220, wordBreak: 'break-all' }}><code>{it.key}</code></td>
                    <td>{name}</td>
                    <td>{meta && meta.date ? meta.date : ''}</td>
                    <td>{subtitle}</td>
                    <td className="text-muted small">{it.payload && it.payload.savedAt ? new Date(it.payload.savedAt).toLocaleString() : ''}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleLoad(it.key)}>Load</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(it.key)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List;
