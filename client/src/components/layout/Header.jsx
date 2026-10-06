import { FiGrid } from 'react-icons/fi';
import PrinterSelector from '../printers/PrinterSelector';

export default function Header() {
  return (
    <header className="flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 py-2 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-md border border-blue-600 bg-blue-600/10 text-blue-600">
          <FiGrid className="size-4" aria-hidden="true" />
        </div>
        <div>
          <div className="font-mono text-sm font-semibold">QR Label Printer</div>
          <div className="font-mono text-xs text-slate-500">ZPL network printing</div>
        </div>
      </div>
      <PrinterSelector />
    </header>
  );
}
