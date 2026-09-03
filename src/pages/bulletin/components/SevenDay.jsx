import React from 'react';
import ImagePicker from './ImagePicker';
import EditableList from './EditableList';

const SevenDay = ({ cards, setCards, images }) => (
  <section>
    <h3>7-day Outlook</h3>
    <EditableList
      items={cards}
      onChange={setCards}
      renderItem={(card, idx) => (
        <div className="col-sm-6" key={idx}>
          <div className="card p-2">
            <input className="form-control mb-1" placeholder="Title" value={card.title || ''} onChange={(e) => setCards(cards.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))} />
            <ImagePicker section="seven-day" images={images} value={card.image} onChange={(v) => setCards(cards.map((s, i) => (i === idx ? { ...s, image: v } : s)))} size={80} />
            <input className="form-control" placeholder="Description" value={card.desc || ''} onChange={(e) => setCards(cards.map((s, i) => i === idx ? { ...s, desc: e.target.value } : s))} />
          </div>
        </div>
      )}
    />
  </section>
);

export default SevenDay;
