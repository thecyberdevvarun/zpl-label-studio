// A row of mutually exclusive choices (radio buttons styled as buttons).
export default function SegmentedControl({ legend, name, options, value, onChange, hint }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{legend}</legend>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map(({ value: optionValue, label, icon: Icon }) => (
          <label key={optionValue} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="peer sr-only"
            />
            <span className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm font-medium leading-tight text-slate-600 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-checked:ring-1 peer-checked:ring-indigo-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600">
              {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
              {label}
            </span>
          </label>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </fieldset>
  );
}
