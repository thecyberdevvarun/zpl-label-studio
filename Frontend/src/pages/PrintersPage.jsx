import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiEdit2, FiPlus, FiServer, FiTrash2, FiWifi } from 'react-icons/fi';
import { usePrinterContext } from '../context/PrinterContext';
import { checkPrinter } from '../api/printApi';
import { STATUS } from '../components/layout/StatusDot';
import PrinterFormModal from '../components/printers/PrinterFormModal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

const TONE = { online: 'emerald', offline: 'rose', checking: 'amber', unknown: 'slate' };

export default function PrintersPage() {
  const { printers, selected, selectPrinter, removePrinter, status } = usePrinterContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tested, setTested] = useState({}); // printer id -> 'checking' | 'online' | 'offline'

  // "Add a printer" links elsewhere in the app arrive here asking for the form.
  useEffect(() => {
    if (location.state?.add) {
      setEditing(null);
      setFormOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setFormOpen(true);
  };

  const test = async (p) => {
    setTested((t) => ({ ...t, [p.id]: 'checking' }));
    try {
      await checkPrinter({ host: p.host, port: p.port });
      setTested((t) => ({ ...t, [p.id]: 'online' }));
      toast.success(`Connected to ${p.name}`);
    } catch (err) {
      setTested((t) => ({ ...t, [p.id]: 'offline' }));
      toast.error(err.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Remove ${p.name}?`)) return;
    try {
      await removePrinter(p.id);
      toast(`Removed ${p.name}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Printers</h2>
          <p className="mt-1 text-sm text-slate-500">The label printers you can print to. Everyone using this app sees the same list.</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openAdd}>
          Add printer
        </Button>
      </div>

      {printers.length === 0 ? (
        <Card bodyClassName="p-0">
          <EmptyState
            icon={FiServer}
            title="No printers yet"
            action={
              <Button variant="primary" icon={FiPlus} onClick={openAdd}>
                Add your first printer
              </Button>
            }
          >
            Enter the IP address of your ZPL label printer. Port 9100 is the usual one for network label printers.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {printers.map((p) => {
            const inUse = selected?.id === p.id;
            const state = inUse ? status : tested[p.id] || 'unknown';
            const s = STATUS[state];
            return (
              <Card
                key={p.id}
                bodyClassName="p-5 space-y-4"
                className={`transition-shadow hover:shadow-md ${inUse ? 'ring-2 ring-indigo-500/60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${inUse ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <FiServer className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-900" title={p.name}>
                        {p.name}
                      </h3>
                      <p className="font-mono text-xs text-slate-500">
                        {p.host}:{p.port}
                      </p>
                    </div>
                  </div>
                  {inUse && (
                    <Badge tone="indigo">
                      <FiCheck className="size-3" aria-hidden="true" /> In use
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={TONE[state]} dot={s.dot}>
                    {state === 'unknown' && !inUse ? 'Not tested' : s.label}
                  </Badge>
                  <Badge>{p.dpi || 203} dpi</Badge>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                  {!inUse && (
                    <Button size="sm" onClick={() => selectPrinter(p.id)}>
                      Use
                    </Button>
                  )}
                  <Button size="sm" icon={FiWifi} onClick={() => test(p)} disabled={tested[p.id] === 'checking'}>
                    Test
                  </Button>
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                      <FiEdit2 className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p)} aria-label={`Remove ${p.name}`}>
                      <FiTrash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PrinterFormModal open={formOpen} onClose={() => setFormOpen(false)} printer={editing} />
    </div>
  );
}
