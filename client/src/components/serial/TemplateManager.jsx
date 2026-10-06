import { useEffect, useState } from 'react';
import { FiSave, FiTrash2 } from 'react-icons/fi';
import Button from '../ui/Button';
import { inputClass, TextInput } from '../ui/Field';

export default function TemplateManager({ templates, activeId, onSelect, onSave, onDelete }) {
  const active = templates.find((t) => t.id === activeId);
  const [name, setName] = useState(active?.name ?? '');
  useEffect(() => setName(active?.name ?? ''), [active?.name]);

  const lastPrinted = active?.lastPrinted ? `${active.lastPrinted.start} to ${active.lastPrinted.end}` : 'none';

  return (
    <div className="rounded-lg border border-slate-300 bg-slate-100 p-4">
      <label htmlFor="template-select" className="mb-2 block font-mono text-xs font-medium text-slate-600">
        Saved templates
      </label>
      <div className="flex gap-2.5">
        <select id="template-select" value={activeId} onChange={(e) => onSelect(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">Choose a saved template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <Button icon={FiTrash2} disabled={!activeId} onClick={() => onDelete(activeId)}>
          Delete
        </Button>
      </div>
      <div className="mt-3 flex gap-2.5">
        <TextInput className="bg-white" placeholder="Template name" aria-label="Template name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button icon={FiSave} onClick={() => onSave(name.trim())}>
          Save
        </Button>
      </div>
      <p className="mt-3 font-mono text-xs text-slate-600">Last printed: {lastPrinted}</p>
    </div>
  );
}
