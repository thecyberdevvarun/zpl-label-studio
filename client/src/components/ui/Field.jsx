export const inputClass =
  'h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-3 font-mono text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:bg-white';

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs font-medium text-slate-600">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
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
