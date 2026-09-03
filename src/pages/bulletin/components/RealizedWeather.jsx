import React from 'react';
import ImagePicker from './ImagePicker';
import EditableList from './EditableList';
import RichText from './RichText';

const RealizedWeather = ({ items, setItems, images }) => (
  <section>
    <h3>Realized Weather</h3>
    <EditableList
      items={items}
      onChange={setItems}
      renderItem={(item, idx) => (
        <div className="row w-100 g-2 align-items-start">
          <div className="col-sm-3 d-flex">
            <ImagePicker section="realized" images={images} value={item.image} onChange={(v) => setItems(items.map((r, i) => (i === idx ? { ...r, image: v } : r)))} size={96} />
          </div>
          <div className="col-sm-9">
            <input className="form-control mb-2" placeholder="Title" value={item.title || ''} onChange={(e) => setItems(items.map((r, i) => i === idx ? { ...r, title: e.target.value } : r))} />
            <RichText value={item.desc || ''} onChange={(v) => setItems(items.map((r, i) => i === idx ? { ...r, desc: v } : r))} />
          </div>
        </div>
      )}
    />
  </section>
);

export default RealizedWeather;
