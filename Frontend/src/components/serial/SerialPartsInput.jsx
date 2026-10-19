import { TextInput } from '../ui/Field';

// Three boxes that together form one serial: prefix + number + suffix.
export default function SerialPartsInput({ label, value, onChange }) {
  const set = (key) => (e) => {
    const next = key === 'number' ? e.target.value.replace(/\D/g, '') : e.target.value;
    onChange({ ...value, [key]: next });
  };

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{label}</legend>
      <div className="grid grid-cols-3 gap-2.5">
        <TextInput className="font-mono" aria-label={`${label} prefix`} placeholder="Prefix" value={value.prefix} onChange={set('prefix')} />
        <TextInput className="font-mono" aria-label={`${label} number`} placeholder="000001" inputMode="numeric" value={value.number} onChange={set('number')} />
        <TextInput className="font-mono" aria-label={`${label} suffix`} placeholder="Suffix" value={value.suffix} onChange={set('suffix')} />
      </div>
    </fieldset>
  );
}
