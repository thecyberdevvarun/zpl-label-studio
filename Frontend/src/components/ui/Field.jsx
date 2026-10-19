import { useEffect, useState } from 'react';

export const inputClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400';

export function Field({ label, hint, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-rose-600">
          {error}
        </span>
      ) : (
        hint && <span className="text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}

export function TextInput({ className = '', ...props }) {
  return <input type="text" className={`${inputClass} ${className}`} {...props} />;
}

// Keeps '' while the user is clearing the field; values are validated before printing.
export function NumberInput({ value, onChange, ...props }) {
  return (
    <input
      type="number"
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      {...props}
    />
  );
}

const formatDecimal = (n, decimals) => (Number.isFinite(n) ? String(Number(n.toFixed(decimals))) : '');

// A number box that accepts decimals. It keeps what you type ("2." or "") while you type,
// and only tidies the number when you leave the box.
export function DecimalInput({ value, onChange, min, max, decimals = 2, ...props }) {
  const [text, setText] = useState(formatDecimal(value, decimals));

  // Follow outside changes (choosing a preset, switching unit).
  useEffect(() => {
    if (formatDecimal(parseFloat(text), decimals) !== formatDecimal(value, decimals)) {
      setText(formatDecimal(value, decimals));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e) => {
    setText(e.target.value);
    const n = parseFloat(e.target.value);
    if (Number.isFinite(n)) onChange(n);
  };

  const handleBlur = () => {
    const n = parseFloat(text);
    const fixed = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : value;
    onChange(fixed);
    setText(formatDecimal(fixed, decimals));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={inputClass}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
