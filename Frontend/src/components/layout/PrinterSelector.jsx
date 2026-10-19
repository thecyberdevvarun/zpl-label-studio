import { Link } from 'react-router-dom';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { usePrinterContext } from '../../context/PrinterContext';
import { STATUS } from './StatusDot';
import Button from '../ui/Button';

// Printer picker + live status, shown in the top bar of every page.
export default function PrinterSelector() {
  const { printers, selected, selectPrinter, status, statusError, refreshStatus } = usePrinterContext();

  if (!printers.length) {
    return (
      <Button as={Link} to="/printers" state={{ add: true }} variant="primary" size="sm" icon={FiPlus}>
        Add a printer
      </Button>
    );
  }

  const s = STATUS[status];

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="printer-select">
        Printer
      </label>
      <select
        id="printer-select"
        value={selected?.id ?? ''}
        onChange={(e) => selectPrinter(e.target.value)}
        className="h-9 max-w-28 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:max-w-60"
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
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm hover:border-slate-400 hover:bg-slate-50"
      >
        <span className={`size-2 rounded-full ${s.dot}`} />
        <span className="hidden sm:inline">{s.label}</span>
        <FiRefreshCw className="size-3.5 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Check connection</span>
      </button>
    </div>
  );
}
