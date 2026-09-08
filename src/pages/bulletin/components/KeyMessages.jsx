import React from 'react';
import ImagePicker from './ImagePicker';
import EditableList from './EditableList';
import RichText from './RichText';
import SectionHeading from './SectionHeading';

const KeyMessages = ({ title, subtitle, setTitle, setSubtitle, items, setItems, images }) => (
  <section>
    <SectionHeading sectionKey="key-messages" title={title} subtitle={subtitle} setTitle={setTitle} setSubtitle={setSubtitle} />
    <EditableList
      items={items}
      onChange={setItems}
      renderItem={(item, idx) => (
        <div className="row w-100 g-2">
          <div className="col-sm-2">
            <ImagePicker section="key-messages" images={images} value={item.image} onChange={(v) => setItems(items.map((k, i) => (i === idx ? { ...k, image: v } : k)))} size={60} />
          </div>
          <div className="col-sm-10">
            <RichText value={item.message || ''} onChange={(v) => setItems(items.map((k, i) => i === idx ? { ...k, message: v } : k))} />
          </div>
        </div>
      )}
    />
  </section>
);

export default KeyMessages;
