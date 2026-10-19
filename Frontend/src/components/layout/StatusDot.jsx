import { usePrinterContext } from '../../context/PrinterContext';

export const STATUS = {
  unknown: { label: 'No printer', dot: 'bg-slate-400', text: 'text-slate-500' },
  checking: { label: 'Checking…', dot: 'animate-pulse bg-amber-400', text: 'text-amber-600' },
  online: { label: 'Online', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  offline: { label: 'Offline', dot: 'bg-rose-500', text: 'text-rose-600' },
};

// Small coloured dot + word showing whether the selected printer can be reached.
export default function StatusDot({ className = '', light = false }) {
  const { status } = usePrinterContext();
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${light ? 'text-slate-300' : s.text} ${className}`}>
      <span className={`size-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
