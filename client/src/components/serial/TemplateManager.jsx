import { useEffect, useState } from 'react';
import { FiSave, FiTrash2 } from 'react-icons/fi';
import Button from '../ui/Button';
import { inputClass, TextInput } from '../ui/Field';

// Pick a saved template, or save the current setup under a name.
export default function TemplateManager({ templates, activeId, onSelect, onSave, onDelete }) {
  const active = templates.find((t) => t.id === activeId);
  const [name, setName] = useState(active?.name ?? '');
  useEffect(() => setName(active?.name ?? ''), [active?.name]);

  const lastPrinted = active?.lastPrinted ? `${active.lastPrinted.start} to ${active.lastPrinted.end}` : 'none';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="template-select" className="mb-1.5 block text-sm font-medium text-slate-700">
          Load a template
        </label>
        <div className="flex gap-2">
          <select id="template-select" value={activeId} onChange={(e) => onSelect(e.target.value)} className={inputClass}>
            <option value="">Choose a saved template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Button variant="danger" size="icon" className="!h-10 !w-10" disabled={!activeId} onClick={() => onDelete(activeId)} aria-label="Delete template">
            <FiTrash2 className="size-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">Last printed: {lastPrinted}</p>
      </div>
      <div>
        <label htmlFor="template-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Save as a template
        </label>
        <div className="flex gap-2">
          <TextInput id="template-name" placeholder="Template name" aria-label="Template name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button icon={FiSave} onClick={() => onSave(name.trim())}>
            Save
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">Saves the serial range and all label settings.</p>
      </div>
    </div>
  );
}
