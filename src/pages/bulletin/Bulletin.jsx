import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import s from './Bulletin.module.scss';
import { getImages } from '../../services/imageService';
import { toast } from 'react-toastify';
import ImagePicker from './components/ImagePicker';
import EditableList from './components/EditableList';
import Metadata from './components/Metadata';
import RealizedWeather from './components/RealizedWeather';
import KeyMessages from './components/KeyMessages';
import Drivers from './components/Drivers';
import SevenDay from './components/SevenDay';
import ExtendedRange from './components/ExtendedRange';
import OceanWatch from './components/OceanWatch';
import Logos from './components/Logos';
import BulletinNavigator from './components/BulletinNavigator';

// Using componentized sections below

const STORAGE_KEY = 'unSavedDraft';
const DEFAULT_SECTION_TITLES = {
  realized: 'Realized Weather',
  keyMessages: 'Key Messages',
  drivers: 'Regional Drivers',
  sevenDay: '7-day Outlook',
  extended: 'Extended Range Outlook',
  oceanWatch: 'Ocean Watch',
  logos: 'Logos',
};

const readDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
};

const Bulletin = () => {
  const navigate = useNavigate();
  const [draft] = useState(readDraft);
  const initialSectionTitles = {
    ...DEFAULT_SECTION_TITLES,
    ...(draft.sectionTitles || {}),
    ...(draft.driversTitle ? { drivers: draft.driversTitle } : {}),
  };
  const [meta, setMeta] = useState(draft.meta || { title: '', date: '', subtitle: '', name: '' });
  const [realized, setRealized] = useState(draft.realized || []);
  const [keyMessages, setKeyMessages] = useState(draft.keyMessages || []);
  const [drivers, setDrivers] = useState(draft.drivers || []);
  const [sevenDay, setSevenDay] = useState(draft.sevenDay || []);
  const [extended, setExtended] = useState(draft.extended || []);
  const [oceanWatch, setOceanWatch] = useState(draft.oceanWatch || []);
  const [logos, setLogos] = useState(draft.logos || []);
  const [sectionTitles, setSectionTitles] = useState(initialSectionTitles);
  const [sectionSubtitles, setSectionSubtitles] = useState(draft.sectionSubtitles || {});
  const [images, setImages] = useState([]);
  const [openSection, setOpenSection] = useState('metadata');

  const saveBulletin = () => {
    const payload = { meta, realized, keyMessages, drivers, sevenDay, extended, oceanWatch, logos, driversTitle: sectionTitles.drivers, sectionTitles, sectionSubtitles, savedAt: Date.now() };
    try {
      // Prefer meta.date as storage key when available, sanitized to a safe token
      const dateKey = (meta && meta.date) ? String(meta.date).trim() : '';
      const safeKey = dateKey
        ? `bulletin:${dateKey.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-:]/g, '')}`
        : `bulletin:${Date.now()}`;
      localStorage.setItem(safeKey, JSON.stringify(payload));
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Bulletin saved to list');
    } catch (err) {
      toast.error('Failed to save bulletin');
    }
  };

  const handleViewReport = () => {
    const payload = {
      meta,
      realized,
      keyMessages,
      driversTitle: sectionTitles.drivers,
      drivers,
      sevenDay,
      extended,
      oceanWatch,
      logos,
      sectionTitles,
      sectionSubtitles,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem('bulletin:report-source', JSON.stringify({ sourceKey: STORAGE_KEY }));
    navigate('/app/bulletin/report');
  };

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    let mounted = true;
    getImages().then((list) => { if (mounted) setImages(list); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const payload = {
        meta,
        realized,
        keyMessages,
        driversTitle: sectionTitles.drivers,
        drivers,
        sevenDay,
        extended,
        oceanWatch,
        logos,
        sectionTitles,
        sectionSubtitles,
        savedAt: Date.now(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        // Ignore storage quota and unavailable-storage errors.
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [meta, realized, keyMessages, drivers, sevenDay, extended, oceanWatch, logos, sectionTitles, sectionSubtitles]);

  /* Previous generic subtitle implementation, retained for reference:
  const renderSectionSubtitle = (sectionKey) => (
    <div className="mb-3">
      <label className="form-label" htmlFor={`subtitle-${sectionKey}`}>Section subtitle</label>
      <input
        id={`subtitle-${sectionKey}`}
        className="form-control"
        value={sectionSubtitles[sectionKey] || ''}
        onChange={(event) => setSectionSubtitles((previous) => ({
          ...previous,
          [sectionKey]: event.target.value,
        }))}
        placeholder="Add a subtitle"
      />
    </div>
  );
  */

  return (
    <div className={s.root}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="mb-0">Create / Edit Bulletin</h1>
          {/* <p className="text-muted small mb-0">Fill out bulletin sections below and generate/preview the styled report</p> */}
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/app/bulletin/list')}>
            📋 All Bulletins
          </button>
          <button type="button" className="btn btn-outline-primary" onClick={handleViewReport}>
            📊 View Report
          </button>
          <button type="button" className="btn btn-success" onClick={saveBulletin}>
            💾 Save Bulletin
          </button>
        </div>
      </div>

      {/* <BulletinNavigator
        sections={[
          { key: 'metadata', label: 'Metadata' },
          { key: 'realized', label: 'Realized' },
          { key: 'key-messages', label: 'Key Messages' },
          { key: 'drivers', label: 'Drivers' },
          { key: 'seven-day', label: '7-day' },
          { key: 'extended', label: 'Extended' },
          { key: 'ocean', label: 'Ocean Watch' },
          { key: 'logos', label: 'Logos' },
        ]}
        openSection={openSection}
        onChange={setOpenSection}
      /> */}

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('metadata')}>
          <div>{openSection === 'metadata' ? null : 'Metadata'}</div>
          <div>{openSection === 'metadata' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'metadata' ? s.accordionOpen : ''}`}>
          <Metadata meta={meta} setMeta={setMeta} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('realized')}>
          <div>{openSection === 'realized' ? null : 'Realized'}</div>
          <div>{openSection === 'realized' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'realized' ? s.accordionOpen : ''}`}>
          {/* {renderSectionSubtitle('realized')} */}
          <RealizedWeather title={sectionTitles.realized} subtitle={sectionSubtitles.realized} setTitle={(value) => setSectionTitles((previous) => ({ ...previous, realized: value }))} setSubtitle={(value) => setSectionSubtitles((previous) => ({ ...previous, realized: value }))} items={realized} setItems={setRealized} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('key-messages')}>
          <div>{openSection === 'key-messages' ? null : 'Key Messages'}</div>
          <div>{openSection === 'key-messages' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'key-messages' ? s.accordionOpen : ''}`}>
          {/* {renderSectionSubtitle('keyMessages')} */}
          <KeyMessages title={sectionTitles.keyMessages} subtitle={sectionSubtitles.keyMessages} setTitle={(value) => setSectionTitles((previous) => ({ ...previous, keyMessages: value }))} setSubtitle={(value) => setSectionSubtitles((previous) => ({ ...previous, keyMessages: value }))} items={keyMessages} setItems={setKeyMessages} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('drivers')}>
          <div>{openSection === 'drivers' ? null : sectionTitles.drivers}</div>
          <div>{openSection === 'drivers' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'drivers' ? s.accordionOpen : ''}`}>
          {/* {renderSectionSubtitle('drivers')} */}
          <Drivers title={sectionTitles.drivers} subtitle={sectionSubtitles.drivers} setTitle={(value) => setSectionTitles((previous) => ({ ...previous, drivers: value }))} setSubtitle={(value) => setSectionSubtitles((previous) => ({ ...previous, drivers: value }))} items={drivers} setItems={setDrivers} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('seven-day')}>
          <div>{openSection === 'seven-day' ? null : '7-day Country Outlook'}</div>
          <div>{openSection === 'seven-day' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'seven-day' ? s.accordionOpen : ''}`}>
          {/* {renderSectionSubtitle('sevenDay')} */}
          <SevenDay title={sectionTitles.sevenDay} subtitle={sectionSubtitles.sevenDay} setTitle={(value) => setSectionTitles((previous) => ({ ...previous, sevenDay: value }))} setSubtitle={(value) => setSectionSubtitles((previous) => ({ ...previous, sevenDay: value }))} cards={sevenDay} setCards={setSevenDay} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('extended')}>
          <div>{openSection === 'extended' ? null : 'Extended Range Outlook'}</div>
          <div>{openSection === 'extended' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'extended' ? s.accordionOpen : ''}`}>
          {/* {renderSectionSubtitle('extended')} */}
          <ExtendedRange title={sectionTitles.extended} subtitle={sectionSubtitles.extended} setTitle={(value) => setSectionTitles((previous) => ({ ...previous, extended: value }))} setSubtitle={(value) => setSectionSubtitles((previous) => ({ ...previous, extended: value }))} items={extended} setItems={setExtended} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('ocean')}>
          <div>{openSection === 'ocean' ? null : 'Ocean Watch'}</div>
          <div>{openSection === 'ocean' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'ocean' ? s.accordionOpen : ''}`}>
          {/* {renderSectionSubtitle('oceanWatch')} */}
          <OceanWatch title={sectionTitles.oceanWatch} subtitle={sectionSubtitles.oceanWatch} setTitle={(value) => setSectionTitles((previous) => ({ ...previous, oceanWatch: value }))} setSubtitle={(value) => setSectionSubtitles((previous) => ({ ...previous, oceanWatch: value }))} items={oceanWatch} setItems={setOceanWatch} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('logos')}>
          <div>{openSection === 'logos' ? null : 'Logos'}</div>
          <div>{openSection === 'logos' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'logos' ? s.accordionOpen : ''}`}>
          {/* {renderSectionSubtitle('logos')} */}
          <Logos title={sectionTitles.logos} subtitle={sectionSubtitles.logos} setTitle={(value) => setSectionTitles((previous) => ({ ...previous, logos: value }))} setSubtitle={(value) => setSectionSubtitles((previous) => ({ ...previous, logos: value }))} images={images} logos={logos} setLogos={setLogos} />
        </div>
      </section>

      <div className="mt-4 d-flex gap-2 align-items-center">
        <button type="button" className="btn btn-success" onClick={saveBulletin}>💾 Save Bulletin</button>
        <button type="button" className="btn btn-outline-primary" onClick={handleViewReport}>📊 View Report</button>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/app/bulletin/list')}>📋 All Bulletins</button>
      </div>

      <div className={s.floatingNav}>
        <BulletinNavigator
          sections={[
            { key: 'metadata', label: 'Metadata' },
            { key: 'realized', label: 'Realized Weather' },
            { key: 'key-messages', label: 'Key Messages' },
            { key: 'drivers', label: 'Key Regional Drivers' },
            { key: 'seven-day', label: '7-day' },
            { key: 'extended', label: 'Extended Range Outlook' },
            { key: 'ocean', label: 'Ocean Watch' },
            { key: 'logos', label: 'Logos' },
          ]}
          openSection={openSection}
          onChange={setOpenSection}
          onSave={saveBulletin}
        />
      </div>
    </div>
  );
};

export default Bulletin;
