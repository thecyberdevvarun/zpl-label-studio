import { FiInfo } from 'react-icons/fi';
import SerialPartsInput from './SerialPartsInput';

export default function SerialRangeForm({ start, end, onStartChange, onEndChange, range, textOnly }) {
  const first = range.serials[0];
  const last = range.serials[range.serials.length - 1];

  if (textOnly) {
    return (
      <p className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <FiInfo className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span>
          Text-only labels don't use serial numbers. Set how many labels to print under{' '}
          <span className="font-medium">Number of labels to print</span> in Label size.
        </span>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SerialPartsInput label="Start serial" value={start} onChange={onStartChange} />
        <SerialPartsInput label="End serial" value={end} onChange={onEndChange} />
      </div>

      {range.error ? (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          {range.error}
        </p>
      ) : (
        <div className="rounded-lg bg-indigo-50 px-4 py-2.5 text-sm text-slate-700">
          <span className="font-semibold text-indigo-700">{range.total}</span> label{range.total > 1 ? 's' : ''}:{' '}
          <span className="font-mono font-medium">{first}</span>
          {range.total > 1 && (
            <>
              {' '}to <span className="font-mono font-medium">{last}</span>
            </>
          )}
        </div>
      )}

      <details className="rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-600">Show all serials in the range</summary>
        <pre className="max-h-40 overflow-y-auto border-t border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed">
          {range.serials.length ? range.serials.join('\n') : '—'}
        </pre>
      </details>
    </div>
  );
}
