import { FiPlus, FiRefreshCw, FiSettings } from 'react-icons/fi';
import { usePrinterContext } from '../../context/PrinterContext';
import Button from '../ui/Button';

const STATUS = {
  unknown: { label: 'No printer', dot: 'bg-slate-400' },
  checking: { label: 'Checking…', dot: 'animate-pulse bg-amber-500' },
  online: { label: 'Online', dot: 'bg-emerald-500' },
  offline: { label: 'Offline', dot: 'bg-red-500' },
};

export default function PrinterSelector() {
  const { printers, selected, selectPrinter, status, statusError, refreshStatus, openManager } = usePrinterContext();

  if (!printers.length) {
    return (
      <Button variant="primary" size="sm" icon={FiPlus} onClick={openManager}>
        Add a printer
      </Button>
    );
  }

  const s = STATUS[status];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="printer-select">
        Printer
      </label>
      <select
        id="printer-select"
        value={selected?.id ?? ''}
        onChange={(e) => selectPrinter(e.target.value)}
        className="h-9 max-w-56 rounded-md border border-slate-300 bg-slate-100 px-3 font-mono text-xs outline-none focus:border-blue-600"
      >
        {printers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.host}:{p.port})
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={refreshStatus}
        title={statusError || 'Check printer connection'}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-300 px-3 font-mono text-xs text-slate-600 hover:border-slate-400"
      >
        <span className={`size-2 rounded-full ${s.dot}`} />
        {s.label}
        <FiRefreshCw className="size-3" aria-hidden="true" />
      </button>

      <Button variant="ghost" size="icon" onClick={openManager} aria-label="Manage printers" title="Manage printers">
        <FiSettings className="size-4" />
      </Button>
    </div>
  );
}
