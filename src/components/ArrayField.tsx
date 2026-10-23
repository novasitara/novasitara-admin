import React from 'react';
import { Plus, X } from 'lucide-react';

/** Editable list of short text items (job requirements, slide tags, ...). */
export const ArrayField: React.FC<{ label: string; items: string[]; onChange: (v: string[]) => void }> = ({ label, items, onChange }) => (
  <div>
    <label className="label">{label}</label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, i) => (
        <div key={i} className="array-field-row">
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }} className="input" style={{ flex: 1 }} placeholder={`${label} ${i + 1}`} />
          {items.length > 1 && <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="array-field-remove"><X size={13} /></button>}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="array-field-add">
        <Plus size={13} /> Add item
      </button>
    </div>
  </div>
);
