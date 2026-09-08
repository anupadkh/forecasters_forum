import React from 'react';
import ImagePicker from './ImagePicker';
import EditableList from './EditableList';
import SectionHeading from './SectionHeading';

const OceanWatch = ({ title, subtitle, setTitle, setSubtitle, items, setItems, images }) => (
  <section>
    <SectionHeading sectionKey="ocean-watch" title={title} subtitle={subtitle} setTitle={setTitle} setSubtitle={setSubtitle} />
    <EditableList
      items={items}
      onChange={setItems}
      renderItem={(item, idx) => (
        <div>
          <input className="form-control mb-1" placeholder="Card title" value={item.title || ''} onChange={(e) => setItems(items.map((o, i) => i === idx ? { ...o, title: e.target.value } : o))} />
          <EditableList
            items={item.items || []}
            onChange={(its) => setItems(items.map((o, i) => i === idx ? { ...o, items: its } : o))}
            renderItem={(it, itIdx) => (
              <div className="row g-2 w-100">
                <div className="col-sm-3">
                  <ImagePicker section="ocean" images={images} value={it.image} onChange={(v) => setItems(items.map((o, i) => i === idx ? { ...o, items: (o.items || []).map((x, j) => j === itIdx ? { ...x, image: v } : x) } : o))} size={80} />
                </div>
                <div className="col-sm-9">
                  <input className="form-control" placeholder="Description" value={it.desc || ''} onChange={(e) => setItems(items.map((o, i) => i === idx ? { ...o, items: (o.items || []).map((x, j) => j === itIdx ? { ...x, desc: e.target.value } : x) } : o))} />
                </div>
              </div>
            )}
          />
        </div>
      )}
    />
  </section>
);

export default OceanWatch;
