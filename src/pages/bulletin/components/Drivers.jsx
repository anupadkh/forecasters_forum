import React from 'react';
import ImagePicker from './ImagePicker';
import EditableList from './EditableList';
import RichText from './RichText';
import SectionHeading from './SectionHeading';

const Drivers = ({ title, subtitle, setTitle, setSubtitle, items, setItems, images }) => (
  <section>
    <SectionHeading sectionKey="drivers" title={title} subtitle={subtitle} setTitle={setTitle} setSubtitle={setSubtitle} />
    <EditableList
      items={items}
      onChange={setItems}
      renderItem={(item, idx) => (
        <div className="row w-100 g-2">
          <div className="col-sm-3">
            <ImagePicker section="drivers" images={images} value={item.image} onChange={(v) => setItems(items.map((d, i) => (i === idx ? { ...d, image: v } : d)))} size={60} />
          </div>
          <div className="col-sm-9">
            <RichText
              value={item.message || ''}
              onChange={(html) => setItems(items.map((d, i) => i === idx ? { ...d, message: html } : d))}
              placeholder="Message"
            />
          </div>
        </div>
      )}
    />
  </section>
);

export default Drivers;
