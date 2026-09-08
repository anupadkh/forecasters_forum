import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import s from './Bulletin.module.scss';
import { loadAllTemplates, BUILTIN_TEMPLATES, ACTIVE_TEMPLATE_KEY } from '../bulletin-report/designer';

const STORAGE_PREFIX = 'bulletin:';
const DRAFT_KEY = 'unSavedDraft';
const REPORT_SOURCE_KEY = 'bulletin:report-source';
const REPORT_LAYOUT_PREFIX = 'bulletin:report-layout:';
const TEMPLATES_STORAGE_KEY = 'bulletin:saved-templates';

const getBulletinKeys = () =>
  Object.keys(localStorage).filter(
    (key) =>
      key.startsWith(STORAGE_PREFIX) &&
      key !== REPORT_SOURCE_KEY &&
      key !== ACTIVE_TEMPLATE_KEY &&
      key !== TEMPLATES_STORAGE_KEY &&
      !key.startsWith(REPORT_LAYOUT_PREFIX)
  );

const List = () => {
  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState({});
  const [availableTemplates, setAvailableTemplates] = useState(loadAllTemplates);
  const navigate = useNavigate();

  useEffect(() => {
    setAvailableTemplates(loadAllTemplates());
    const keys = getBulletinKeys();
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
    setAvailableTemplates(loadAllTemplates());
    const keys = getBulletinKeys();
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

  const handleGenerateReport = (key) => {
    const defaultId = availableTemplates[0]?.id || BUILTIN_TEMPLATES[0].id;
    const templateId = templates[key] || defaultId;
    localStorage.setItem(REPORT_SOURCE_KEY, JSON.stringify({ sourceKey: key, templateId }));
    navigate('/app/bulletin/report');
  };

  const handleDelete = (key) => {
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
        <div>
          <h1>Bulletins</h1>
          <p className="text-muted small mb-0">Manage saved bulletins and generate styled reports using design templates</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => navigate('/app/bulletin/designer')}>
            🎨 Design Templates
          </button>
          <button className="btn btn-primary" onClick={handleNew}>
            ➕ Create Bulletin
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info">
          <h5>No saved bulletins found</h5>
          <p className="mb-2">Create a new bulletin or open the sample template in the report viewer.</p>
          <button className="btn btn-sm btn-primary" onClick={handleNew}>
            Create your first bulletin
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Key</th>
                <th>Name / Title</th>
                <th>Date</th>
                <th>Subtitle</th>
                <th>Saved</th>
                <th style={{ minWidth: 200 }}>Report Template</th>
                <th style={{ minWidth: 260 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const meta = it.payload && it.payload.meta;
                const name = (meta && (meta.name || meta.title)) || 'Untitled Bulletin';
                const date =
                  (meta && meta.date) ||
                  (it.payload && it.payload.savedAt
                    ? new Date(it.payload.savedAt).toLocaleDateString()
                    : '');
                const subtitle = (meta && meta.subtitle) || '';
                const defaultTemplateId = availableTemplates[0]?.id || BUILTIN_TEMPLATES[0].id;

                return (
                  <tr key={it.key}>
                    <td style={{ maxWidth: 200, wordBreak: 'break-all' }}>
                      <code>{it.key}</code>
                    </td>
                    <td>
                      <strong>{name}</strong>
                    </td>
                    <td>{date}</td>
                    <td className="text-truncate" style={{ maxWidth: 200 }} title={subtitle}>
                      {subtitle || '-'}
                    </td>
                    <td className="text-muted small">
                      {it.payload && it.payload.savedAt
                        ? new Date(it.payload.savedAt).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={templates[it.key] || defaultTemplateId}
                        onChange={(event) =>
                          setTemplates((previous) => ({
                            ...previous,
                            [it.key]: event.target.value,
                          }))
                        }
                      >
                        {availableTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name || template.label} {template.isBuiltIn ? '(Preset)' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleLoad(it.key)}
                          title="Edit bulletin data"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleGenerateReport(it.key)}
                          title="Generate styled A4 report"
                        >
                          📊 Report
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(it.key)}
                          title="Delete bulletin"
                        >
                          🗑️
                        </button>
                      </div>
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
