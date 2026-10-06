import { useEffect, useRef } from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from '../ui/Button';

const LOG_STYLES = {
  success: { row: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  error: { row: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  info: { row: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800' },
};

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-3.5 py-3">
      <div className="mb-1 font-mono text-xs text-slate-500">{label}</div>
      <div className={`font-mono text-2xl font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

export default function PrintMonitor({ job }) {
  const { status, total, printed, errors, logs, clear } = job;
  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs.length]);
  const started = status !== 'idle';
  const pct = total ? Math.round((printed / total) * 100) : 0;

  const progressLabel = {
    running: `Printing ${printed} of ${total}…`,
    done: `Done — ${printed} printed`,
    stopped: `Stopped — ${printed} of ${total} printed`,
    failed: `Failed — ${printed} of ${total} printed`,
  }[status];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Queued" value={started ? total : '—'} />
        <Stat label="Printed" value={started ? printed : '—'} tone="text-blue-600" />
        <Stat label="Errors" value={started ? errors : '—'} tone="text-red-600" />
      </div>

      {started && (
        <div className="rounded-lg border border-slate-300 bg-white px-4 py-3.5" aria-live="polite">
          <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-600">{progressLabel}</span>
            <span className="font-semibold text-blue-600">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${status === 'failed' ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
        <div className="flex items-center justify-between border-b border-slate-300 px-4 py-2.5">
          <h2 className="font-mono text-xs font-semibold text-slate-600">Print log</h2>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!logs.length && !started}>
            Clear
          </Button>
        </div>
        <div ref={logRef} className="flex h-72 flex-col gap-1 overflow-y-auto p-3" role="log">
          {logs.length === 0 ? (
            <div className="m-auto flex flex-col items-center gap-2 font-mono text-xs text-slate-400">
              <FiInbox className="size-7" aria-hidden="true" />
              No print jobs yet
            </div>
          ) : (
            logs.map((entry) => {
              const s = LOG_STYLES[entry.type];
              return (
                <div key={entry.id} className={`flex animate-log-in items-start gap-2.5 rounded px-2 py-1.5 font-mono text-xs ${s.row}`}>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${s.badge}`}>{entry.badge}</span>
                  {entry.serial && <span className="shrink-0 font-medium">{entry.serial}</span>}
                  <span className="min-w-0 flex-1 break-words text-slate-600">{entry.message}</span>
                  <span className="shrink-0 text-[11px] text-slate-400">{entry.time}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
