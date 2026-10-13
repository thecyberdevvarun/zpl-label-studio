import { Link } from 'react-router-dom';
import { FiActivity, FiAlertTriangle, FiArrowRight, FiClock, FiLayers, FiLoader, FiPlus, FiPrinter, FiRefreshCw, FiServer, FiTag } from 'react-icons/fi';
import { usePrinterContext } from '../context/PrinterContext';
import { useStudio } from '../context/StudioContext';
import { STATUS } from '../components/layout/StatusDot';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import JobsTable from '../components/history/JobsTable';
import { isToday } from '../utils/format';

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  violet: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
};

function StatCard({ icon: Icon, label, value, note, tone }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
        {note && <div className="truncate text-xs text-slate-400">{note}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { printers, selected, status, statusError, refreshStatus } = usePrinterContext();
  const { templates, history, job } = useStudio();

  const totalLabels = history.reduce((sum, e) => sum + e.labels, 0);
  const jobsToday = history.filter((e) => isToday(e.at)).length;
  const s = STATUS[status];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Your printers, templates and recent print jobs at a glance.</p>
        </div>
        <Button as={Link} to="/print" variant="primary" icon={FiPrinter}>
          Print labels
        </Button>
      </div>

      {job.isRunning && (
        <Link
          to="/print"
          className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm text-indigo-900 hover:bg-indigo-100/70"
        >
          <FiLoader className="size-5 animate-spin text-indigo-600" aria-hidden="true" />
          <span className="font-medium">A print job is running</span>
          <span className="text-indigo-700">
            {job.printed} of {job.total} sent
          </span>
          <FiArrowRight className="ml-auto size-4" aria-hidden="true" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FiTag} tone="indigo" label="Labels printed" value={totalLabels.toLocaleString()} note="All time" />
        <StatCard icon={FiActivity} tone="violet" label="Print jobs" value={history.length} note={`${jobsToday} today`} />
        <StatCard icon={FiLayers} tone="emerald" label="Templates" value={templates.length} note="Saved label setups" />
        <StatCard icon={FiServer} tone="amber" label="Printers" value={printers.length} note={selected ? `Using ${selected.name}` : 'None added yet'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Recent print jobs"
          icon={FiClock}
          description="The last jobs sent to a printer"
          bodyClassName="p-0"
          action={
            history.length > 0 && (
              <Link to="/history" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all <FiArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            )
          }
        >
          {history.length ? (
            <JobsTable entries={history.slice(0, 5)} />
          ) : (
            <EmptyState
              icon={FiPrinter}
              title="No print jobs yet"
              action={
                <Button as={Link} to="/print" variant="primary" icon={FiPrinter}>
                  Print your first label
                </Button>
              }
            >
              Jobs you print will show up here, with the printer, the labels and whether they finished.
            </EmptyState>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Printer" icon={FiServer} description={selected ? 'Currently in use' : 'Nothing connected yet'}>
            {selected ? (
              <div className="space-y-4">
                <div>
                  <div className="text-base font-semibold text-slate-900">{selected.name}</div>
                  <div className="font-mono text-sm text-slate-500">
                    {selected.host}:{selected.port}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={{ online: 'emerald', offline: 'rose', checking: 'amber', unknown: 'slate' }[status]} dot={s.dot}>
                    {s.label}
                  </Badge>
                  <Badge>{selected.dpi || 203} dpi</Badge>
                </div>
                {status === 'offline' && statusError && (
                  <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    <FiAlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" /> {statusError}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" icon={FiRefreshCw} onClick={refreshStatus}>
                    Check connection
                  </Button>
                  <Button as={Link} to="/printers" size="sm" variant="ghost">
                    Manage
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Add the IP address of your label printer to start printing.</p>
                <Button as={Link} to="/printers" state={{ add: true }} variant="primary" icon={FiPlus}>
                  Add a printer
                </Button>
              </div>
            )}
          </Card>

          <Card title="Quick actions" icon={FiActivity}>
            <div className="grid gap-2">
              <Button as={Link} to="/print" icon={FiPrinter} className="justify-start">
                Print labels
              </Button>
              <Button as={Link} to="/templates" icon={FiLayers} className="justify-start">
                Templates ({templates.length})
              </Button>
              <Button as={Link} to="/printers" icon={FiServer} className="justify-start">
                Printers ({printers.length})
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
