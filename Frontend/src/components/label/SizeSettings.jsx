import { DEFAULT_DPI, LABEL_PRESETS } from '../../constants/defaults';
import { MM_LIMITS, MM_PER_INCH, labelDots } from '../../utils/label';
import { DecimalInput, Field, NumberInput, inputClass } from '../ui/Field';

const presetKey = (w, h) => `${w}x${h}`;
const presetName = (p) => `${p.width} × ${p.height} mm${p.note ? ` (${p.note})` : ''}`;
const sameSize = (a, b) => Math.abs(a - b) < 0.05;

// Label size: pick a common size or type your own, in mm or inches. Also copies and delay.
export default function SizeSettings({ settings, onChange, dpi = DEFAULT_DPI, printerName }) {
  const textOnly = settings.codeType === 'text';
  const inches = settings.sizeUnit === 'in';
  const unit = inches ? 'in' : 'mm';
  const toShown = (mm) => (inches ? mm / MM_PER_INCH : mm);
  const fromShown = (n) => Math.round((inches ? n * MM_PER_INCH : n) * 100) / 100;
  const limits = MM_LIMITS.map(toShown);

  const matching = LABEL_PRESETS.find(
    (p) => sameSize(p.width, settings.labelWidthMm) && sameSize(p.height, settings.labelHeightMm),
  );
  const dots = labelDots(settings, dpi);

  const choosePreset = (key) => {
    const preset = LABEL_PRESETS.find((p) => presetKey(p.width, p.height) === key);
    if (!preset) return; // "Custom" keeps whatever is typed
    onChange('labelWidthMm', preset.width);
    onChange('labelHeightMm', preset.height);
  };

  return (
    <div className="space-y-4">
      <Field label="Label size">
        <select
          value={matching ? presetKey(matching.width, matching.height) : 'custom'}
          onChange={(e) => choosePreset(e.target.value)}
          className={inputClass}
          aria-label="Label size"
        >
          <option value="custom">Custom size</option>
          {LABEL_PRESETS.map((p) => (
            <option key={presetKey(p.width, p.height)} value={presetKey(p.width, p.height)}>
              {presetName(p)}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label={`Width (${unit})`}>
          <DecimalInput
            value={toShown(settings.labelWidthMm)}
            onChange={(n) => onChange('labelWidthMm', fromShown(n))}
            min={limits[0]}
            max={limits[1]}
            aria-label={`Label width in ${unit}`}
          />
        </Field>
        <Field label={`Height (${unit})`}>
          <DecimalInput
            value={toShown(settings.labelHeightMm)}
            onChange={(n) => onChange('labelHeightMm', fromShown(n))}
            min={limits[0]}
            max={limits[1]}
            aria-label={`Label height in ${unit}`}
          />
        </Field>
        <Field label="Unit">
          <select
            value={settings.sizeUnit}
            onChange={(e) => onChange('sizeUnit', e.target.value)}
            className={inputClass}
            aria-label="Label size unit"
          >
            <option value="mm">Millimetres</option>
            <option value="in">Inches</option>
          </select>
        </Field>
      </div>

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        That is <span className="font-mono font-semibold text-slate-800">{dots.width} × {dots.height} dots</span> at {dpi} dpi
        {printerName ? ` (${printerName})` : dpi === DEFAULT_DPI ? ' (add a printer to set this)' : ''}.
      </p>
      {(dots.tooWide || dots.tooLong) && (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {dots.tooWide ? 'This label is wider than the printer can handle' : 'This label is longer than the printer can handle'}
          ; the size was reduced to fit.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <Field
          label={textOnly ? 'Number of labels to print' : 'Copies per label'}
          hint={textOnly ? 'Each label has the same text.' : undefined}
        >
          <NumberInput value={settings.copies} onChange={(v) => onChange('copies', v)} min={1} max={100} />
        </Field>
        {!textOnly && (
          <Field label="Delay between labels (ms)" hint="Pause between each serial.">
            <NumberInput value={settings.batchDelay} onChange={(v) => onChange('batchDelay', v)} min={0} max={5000} />
          </Field>
        )}
      </div>
    </div>
  );
}
