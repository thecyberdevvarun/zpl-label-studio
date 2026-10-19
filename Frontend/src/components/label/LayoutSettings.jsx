import { FiAlignCenter, FiAlignLeft, FiAlignRight, FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUp } from 'react-icons/fi';
import { Field, NumberInput } from '../ui/Field';
import SegmentedControl from '../ui/SegmentedControl';

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: FiAlignLeft },
  { value: 'center', label: 'Center', icon: FiAlignCenter },
  { value: 'right', label: 'Right', icon: FiAlignRight },
];

const POSITION_OPTIONS = [
  { value: 'top', label: 'Top', icon: FiArrowUp },
  { value: 'bottom', label: 'Bottom', icon: FiArrowDown },
  { value: 'left', label: 'Left', icon: FiArrowLeft },
  { value: 'right', label: 'Right', icon: FiArrowRight },
];

// Where things sit on the label: left/center/right, and where each text goes around the code.
export default function LayoutSettings({ settings, onChange }) {
  const num = (key, props) => <NumberInput value={settings[key]} onChange={(v) => onChange(key, v)} {...props} />;
  const textOnly = settings.codeType === 'text';
  const hasCustomText = Boolean(settings.customText?.trim());
  const centred = settings.align === 'center';

  return (
    <div className="space-y-5">
      <SegmentedControl
        legend="Alignment on the label"
        name="align"
        options={ALIGN_OPTIONS}
        value={settings.align}
        onChange={(v) => onChange('align', v)}
        hint={
          textOnly
            ? 'Places the text on the left, in the centre, or on the right of the label.'
            : 'Places the code and text together on the left, in the centre, or on the right of the label.'
        }
      />

      {!textOnly && (
        <SegmentedControl
          legend="Serial text position (relative to the code)"
          name="textPosition"
          options={POSITION_OPTIONS}
          value={settings.textPosition}
          onChange={(v) => onChange('textPosition', v)}
        />
      )}
      {!textOnly && hasCustomText && (
        <SegmentedControl
          legend="Custom text position (relative to the code and serial)"
          name="customTextPosition"
          options={POSITION_OPTIONS}
          value={settings.customTextPosition}
          onChange={(v) => onChange('customTextPosition', v)}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {!textOnly && <Field label="Spacing between items (dots)">{num('textGap', { min: 0, max: 500 })}</Field>}
        <Field
          label="Side margin (dots)"
          hint={centred ? 'Not used when centred.' : 'From the left edge, or the right edge when aligned right.'}
        >
          {num('marginLeft', { min: 0, max: 9999 })}
        </Field>
        <Field label="Top margin (dots)">{num('marginTop', { min: 0, max: 9999 })}</Field>
      </div>
    </div>
  );
}
