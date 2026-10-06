import SerialPartsInput from './SerialPartsInput';
import TemplateManager from './TemplateManager';

export default function SerialRangeForm({ start, end, onStartChange, onEndChange, range, templateProps }) {
  const first = range.serials[0];
  const last = range.serials[range.serials.length - 1];

  return (
    <div className="space-y-5">
      <TemplateManager {...templateProps} />

      <div className="grid gap-4 md:grid-cols-2">
        <SerialPartsInput label="Start serial" value={start} onChange={onStartChange} />
        <SerialPartsInput label="End serial" value={end} onChange={onEndChange} />
      </div>

      {range.error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
          {range.error}
        </p>
      ) : (
        <div className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-600">
          <span className="font-semibold text-blue-600">{range.total}</span> label{range.total > 1 ? 's' : ''}:{' '}
          <span className="font-semibold text-blue-600">{first}</span>
          {range.total > 1 && (
            <>
              {' '}to <span className="font-semibold text-blue-600">{last}</span>
            </>
          )}
        </div>
      )}

      <details className="rounded-lg border border-slate-300 bg-slate-100">
        <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-medium text-slate-600">
          Serials in range
        </summary>
        <pre className="max-h-40 overflow-y-auto border-t border-slate-300 px-3 py-2 font-mono text-xs leading-relaxed">
          {range.serials.length ? range.serials.join('\n') : '—'}
        </pre>
      </details>
    </div>
  );
}
