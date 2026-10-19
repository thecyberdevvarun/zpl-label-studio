import { FiType } from 'react-icons/fi';
import { BsQrCode, BsUpcScan } from 'react-icons/bs';
import { CUSTOM_TEXT_MAX } from '../../constants/defaults';
import { cleanCustomText } from '../../utils/label';
import { Field, NumberInput, TextInput } from '../ui/Field';
import SegmentedControl from '../ui/SegmentedControl';

const CODE_TYPE_OPTIONS = [
  { value: 'qr', label: 'QR code', icon: BsQrCode },
  { value: 'code128', label: 'Code 128', icon: BsUpcScan },
  { value: 'code39', label: 'Code 39', icon: BsUpcScan },
  { value: 'text', label: 'Text only', icon: FiType },
];

const CODE_TYPE_HINTS = {
  qr: 'A square 2D code that holds the serial number.',
  code128: 'A barcode for letters, numbers and symbols.',
  code39: 'A barcode for capital letters, numbers and - . $ / + % space.',
  text: 'Prints only your custom text. No code and no serial number.',
};

function Divider() {
  return <div className="border-t border-slate-100" />;
}

// What goes on the label: the type of code, the serial text size, and the custom text.
export default function ContentSettings({ settings, onChange, codeIssue }) {
  const num = (key, props) => <NumberInput value={settings[key]} onChange={(v) => onChange(key, v)} {...props} />;
  const { codeType } = settings;
  const textOnly = codeType === 'text';
  const isQr = codeType === 'qr';

  return (
    <div className="space-y-5">
      <SegmentedControl
        legend="Label type"
        name="codeType"
        options={CODE_TYPE_OPTIONS}
        value={codeType}
        onChange={(v) => onChange('codeType', v)}
        hint={CODE_TYPE_HINTS[codeType]}
      />
      {codeIssue && !textOnly && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          {codeIssue}
        </p>
      )}

      {isQr && (
        <div>
          <label htmlFor="qr-size" className="mb-2 block text-sm font-medium text-slate-700">
            QR code size
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
              className="h-1.5 flex-1 cursor-pointer accent-indigo-600"
            />
            <span className="w-8 rounded-md bg-indigo-50 py-0.5 text-center text-sm font-semibold text-indigo-700">
              {settings.qrSize || 6}
            </span>
          </div>
        </div>
      )}
      {!isQr && !textOnly && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bar width (dots)" hint="Thinnest bar. Larger is easier to scan.">
            {num('barWidth', { min: 1, max: 10 })}
          </Field>
          <Field label="Barcode height (dots)">{num('barHeight', { min: 20, max: 500 })}</Field>
        </div>
      )}

      {!textOnly && (
        <>
          <Divider />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Serial text size" hint="The serial number printed once next to the code.">
              {num('fontSize', { min: 10, max: 200 })}
            </Field>
          </div>
        </>
      )}

      <Divider />
      <Field
        label={textOnly ? 'Text to print' : 'Custom text (optional)'}
        error={textOnly && codeIssue ? codeIssue : ''}
        hint="For example “Software Trial”. Letters, numbers and common symbols only."
      >
        <TextInput
          value={settings.customText ?? ''}
          maxLength={CUSTOM_TEXT_MAX}
          placeholder="e.g. Software Trial"
          onChange={(e) => onChange('customText', cleanCustomText(e.target.value))}
        />
      </Field>
      {(Boolean(settings.customText?.trim()) || textOnly) && (
        <div className="grid grid-cols-2 gap-4">
          <Field label={textOnly ? 'Text size' : 'Custom text size'}>{num('customFontSize', { min: 10, max: 200 })}</Field>
        </div>
      )}
    </div>
  );
}
