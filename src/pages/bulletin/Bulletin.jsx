import React, { useState, useEffect } from 'react';
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

const Bulletin = () => {
  const [meta, setMeta] = useState({ title: '', date: '', subtitle: '', name: '' });
  const [realized, setRealized] = useState([]);
  const [keyMessages, setKeyMessages] = useState([]);
  const [driversTitle, setDriversTitle] = useState('Regional Drivers');
  const [drivers, setDrivers] = useState([]);
  const [sevenDay, setSevenDay] = useState(Array.from({ length: 0 }, () => ({ title: '', desc: '', image: '' })));
  const [extended, setExtended] = useState([]);
  const [oceanWatch, setOceanWatch] = useState([]);
  const [logos, setLogos] = useState([]);
  const [images, setImages] = useState([]);
  const [openSection, setOpenSection] = useState('metadata');
  const STORAGE_KEY = 'bulletin:draft';

  const saveBulletin = () => {
    const payload = { meta, realized, keyMessages, driversTitle, drivers, sevenDay, extended, oceanWatch, logos, savedAt: Date.now() };
    try {
      // Prefer meta.date as storage key when available, sanitized to a safe token
      const dateKey = (meta && meta.date) ? String(meta.date).trim() : '';
      const safeKey = dateKey
        ? `bulletin:${dateKey.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-:]/g, '')}`
        : `bulletin:${Date.now()}`;
      localStorage.setItem(safeKey, JSON.stringify(payload));
      toast.success('Bulletin saved to list');
    } catch (err) {
      toast.error('Failed to save bulletin');
    }
  };

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    let mounted = true;
    getImages().then((list) => { if (mounted) setImages(list); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Load saved bulletin draft from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.meta) setMeta(data.meta);
        if (Array.isArray(data.realized)) setRealized(data.realized);
        if (Array.isArray(data.keyMessages)) setKeyMessages(data.keyMessages);
        if (data.driversTitle) setDriversTitle(data.driversTitle);
        if (Array.isArray(data.drivers)) setDrivers(data.drivers);
        if (Array.isArray(data.sevenDay)) setSevenDay(data.sevenDay);
        if (Array.isArray(data.extended)) setExtended(data.extended);
        if (Array.isArray(data.oceanWatch)) setOceanWatch(data.oceanWatch);
        if (Array.isArray(data.logos)) setLogos(data.logos);
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  return (
    <div className={s.root}>
      <h1>Create Bulletin</h1>

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
          <RealizedWeather items={realized} setItems={setRealized} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('key-messages')}>
          <div>{openSection === 'key-messages' ? null : 'Key Messages'}</div>
          <div>{openSection === 'key-messages' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'key-messages' ? s.accordionOpen : ''}`}>
          <KeyMessages items={keyMessages} setItems={setKeyMessages} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('drivers')}>
          <div>{openSection === 'drivers' ? null : driversTitle}</div>
          <div>{openSection === 'drivers' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'drivers' ? s.accordionOpen : ''}`}>
          <Drivers title={driversTitle} setTitle={setDriversTitle} items={drivers} setItems={setDrivers} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('seven-day')}>
          <div>{openSection === 'seven-day' ? null : '7-day Country Outlook'}</div>
          <div>{openSection === 'seven-day' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'seven-day' ? s.accordionOpen : ''}`}>
          <SevenDay cards={sevenDay} setCards={setSevenDay} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('extended')}>
          <div>{openSection === 'extended' ? null : 'Extended Range Outlook'}</div>
          <div>{openSection === 'extended' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'extended' ? s.accordionOpen : ''}`}>
          <ExtendedRange items={extended} setItems={setExtended} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('ocean')}>
          <div>{openSection === 'ocean' ? null : 'Ocean Watch'}</div>
          <div>{openSection === 'ocean' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'ocean' ? s.accordionOpen : ''}`}>
          <OceanWatch items={oceanWatch} setItems={setOceanWatch} images={images} />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader} onClick={() => toggleSection('logos')}>
          <div>{openSection === 'logos' ? null : 'Logos'}</div>
          <div>{openSection === 'logos' ? '▲' : '▼'}</div>
        </div>
        <div className={`${s.accordionBody} ${openSection === 'logos' ? s.accordionOpen : ''}`}>
          <Logos images={images} logos={logos} setLogos={setLogos} />
        </div>
      </section>

      <div className="mt-4">
        <button className="btn btn-success" onClick={saveBulletin}>Save</button>
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
