import { FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUp } from 'react-icons/fi';
import { Field, NumberInput } from '../ui/Field';

const POSITIONS = [
  { value: 'top', label: 'Top', icon: FiArrowUp },
  { value: 'bottom', label: 'Bottom', icon: FiArrowDown },
  { value: 'left', label: 'Left', icon: FiArrowLeft },
  { value: 'right', label: 'Right', icon: FiArrowRight },
];

export default function LabelSettings({ settings, onChange }) {
  const num = (key, props) => <NumberInput value={settings[key]} onChange={(v) => onChange(key, v)} {...props} />;

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-1.5 font-mono text-xs font-medium text-slate-600">Serial text position</legend>
        <div className="grid grid-cols-4 gap-2">
          {POSITIONS.map(({ value, label, icon: Icon }) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="textPosition"
                value={value}
                checked={settings.textPosition === value}
                onChange={() => onChange('textPosition', value)}
                className="peer sr-only"
              />
              <span className="flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white font-mono text-xs font-medium text-slate-600 transition-colors hover:border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600">
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-400">Where the serial number prints, relative to the QR code.</p>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Label width (dots)">{num('labelWidth', { min: 100, max: 2000 })}</Field>
        <Field label="Label height (dots)">{num('labelHeight', { min: 100, max: 2000 })}</Field>
        <Field label="Text size">{num('fontSize', { min: 10, max: 200 })}</Field>
        <Field label="Gap between QR and text (dots)">{num('textGap', { min: 0, max: 500 })}</Field>
        <Field label="Copies per label">{num('copies', { min: 1, max: 100 })}</Field>
        <Field label="Delay between labels (ms)">{num('batchDelay', { min: 0, max: 5000 })}</Field>
      </div>

      <div>
        <label htmlFor="qr-size" className="mb-2 block font-mono text-xs font-medium text-slate-600">
          QR code size (magnification)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="qr-size"
            type="range"
            min="2"
            max="10"
            step="1"
            value={settings.qrSize || 6}
            onChange={(e) => onChange('qrSize', Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-blue-600"
          />
          <span className="w-6 text-right font-mono text-sm text-blue-600">{settings.qrSize || 6}</span>
        </div>
      </div>

      <details className="rounded-lg border border-slate-300 bg-slate-100">
        <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-medium text-slate-600">Margins</summary>
        <div className="border-t border-slate-300 p-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Left margin (dots)">{num('marginLeft', { min: 0, max: 2000 })}</Field>
            <Field label="Top margin (dots)">{num('marginTop', { min: 0, max: 2000 })}</Field>
          </div>
          <p className="mt-2 text-xs text-slate-400">Where the QR code and its text start on the label.</p>
        </div>
      </details>
    </div>
  );
}
