import React from 'react';
import ImagePicker from './ImagePicker';
import EditableList from './EditableList';
import SectionHeading from './SectionHeading';

const ExtendedRange = ({ title, subtitle, setTitle, setSubtitle, items, setItems, images }) => (
  <section>
    <SectionHeading sectionKey="extended" title={title} subtitle={subtitle} setTitle={setTitle} setSubtitle={setSubtitle} />
    <EditableList
      items={items}
      onChange={setItems}
      renderItem={(item, idx) => (
        <div>
          <div className="row g-2 align-items-center mb-2">
            <div className="col-sm-9">
              <input list="extended-titles" className="form-control" value={item.title || ''} onChange={(e) => setItems(items.map((ex, i) => i === idx ? { ...ex, title: e.target.value, image: ex.image || `/images/${e.target.value || 'default'}.jpg` } : ex))} placeholder="Title or choose..." />
              <datalist id="extended-titles">
                <option value="Temperature Outlook">Temperature Outlook</option>
                <option value="Rainfall Outlook">Rainfall Outlook</option>
                <option value="Wind Outlook">Wind Outlook</option>
              </datalist>
            </div>
            <div className="col-sm-3 d-flex justify-content-end">
              <ImagePicker section="extended" images={images} value={item.image} onChange={(v) => setItems(items.map((ex, i) => (i === idx ? { ...ex, image: v } : ex)))} size={80} />
            </div>
          </div>
          <EditableList
            items={item.points || []}
            onChange={(pts) => setItems(items.map((ex, i) => i === idx ? { ...ex, points: pts } : ex))}
            renderItem={(p, pidx) => (
              <div className="row g-2 w-100 align-items-center">
                {/* <div className="col-sm-3">
                  <ImagePicker section="extended-point" images={images} value={p.image} onChange={(v) => setItems(items.map((ex, i) => i === idx ? { ...ex, points: (ex.points || []).map((pp, j) => j === pidx ? { ...pp, image: v } : pp) } : ex))} size={56} />
                </div> */}
                <div className="col-sm-12">
                  <input className="form-control" placeholder="Bullet point" value={p.text || ''} onChange={(e) => setItems(items.map((ex, i) => i === idx ? { ...ex, points: (ex.points || []).map((pp, j) => j === pidx ? { ...pp, text: e.target.value } : pp) } : ex))} />
                </div>
              </div>
            )}
          />
        </div>
      )}
    />
  </section>
);

export default ExtendedRange;
