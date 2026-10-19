import Badge from '../ui/Badge';
import { CODE_TYPE_NAMES, formatDateTime } from '../../utils/format';

const STATUS = {
  done: { tone: 'emerald', label: 'Completed' },
  stopped: { tone: 'amber', label: 'Stopped' },
  failed: { tone: 'rose', label: 'Failed' },
};

// A table of finished print jobs (used on the dashboard and the history page).
export default function JobsTable({ entries }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3 font-medium">When</th>
            <th className="px-3 py-3 font-medium">Printer</th>
            <th className="px-3 py-3 font-medium">Type</th>
            <th className="px-3 py-3 font-medium">Details</th>
            <th className="px-3 py-3 text-right font-medium">Labels</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((e) => {
            const s = STATUS[e.status];
            return (
              <tr key={e.id} className="hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDateTime(e.at)}</td>
                <td className="px-3 py-3 font-medium text-slate-800">{e.printer}</td>
                <td className="px-3 py-3">
                  <Badge tone="indigo">{CODE_TYPE_NAMES[e.type] ?? e.type}</Badge>
                </td>
                <td className="max-w-[260px] px-3 py-3">
                  <div className="truncate font-mono text-xs text-slate-700" title={e.summary}>
                    {e.summary}
                  </div>
                  {e.template && <div className="truncate text-xs text-slate-400">Template: {e.template}</div>}
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-800">{e.labels}</td>
                <td className="px-5 py-3">
                  <Badge tone={s.tone}>{s.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
