import { useEffect, useRef } from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from '../ui/Button';
import Card from '../ui/Card';

const LOG_STYLES = {
  success: { row: 'bg-emerald-50/70', badge: 'bg-emerald-100 text-emerald-700' },
  error: { row: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700' },
  info: { row: 'bg-slate-50', badge: 'bg-slate-200 text-slate-700' },
};

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3.5 py-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={`mt-0.5 text-2xl font-semibold tabular-nums ${tone}`}>{value}</div>
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
    done: `Done — ${printed} sent to the printer`,
    stopped: `Stopped — ${printed} of ${total} sent`,
    failed: `Failed — ${printed} of ${total} sent`,
  }[status];

  return (
    <Card
      title="Print job"
      description="Live progress and log"
      action={
        <Button variant="ghost" size="sm" onClick={clear} disabled={!logs.length && !started}>
          Clear
        </Button>
      }
      bodyClassName="p-5 space-y-4"
    >
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Queued" value={started ? total : '—'} />
        <Stat label="Printed" value={started ? printed : '—'} tone="text-emerald-600" />
        <Stat label="Errors" value={started ? errors : '—'} tone={errors ? 'text-rose-600' : 'text-slate-900'} />
      </div>

      {started && (
        <div aria-live="polite">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">{progressLabel}</span>
            <span className="font-semibold text-indigo-600">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${status === 'failed' ? 'bg-rose-500' : status === 'done' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div ref={logRef} className="flex h-56 flex-col gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2" role="log">
        {logs.length === 0 ? (
          <div className="m-auto flex flex-col items-center gap-2 text-xs text-slate-400">
            <FiInbox className="size-6" aria-hidden="true" />
            No print jobs yet
          </div>
        ) : (
          logs.map((entry) => {
            const s = LOG_STYLES[entry.type];
            return (
              <div key={entry.id} className={`flex animate-log-in items-start gap-2.5 rounded-md px-2.5 py-1.5 text-xs ${s.row}`}>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${s.badge}`}>{entry.badge}</span>
                {entry.serial && <span className="shrink-0 font-mono font-medium text-slate-800">{entry.serial}</span>}
                <span className="min-w-0 flex-1 break-words text-slate-600">{entry.message}</span>
                <span className="shrink-0 font-mono text-[11px] text-slate-400">{entry.time}</span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
