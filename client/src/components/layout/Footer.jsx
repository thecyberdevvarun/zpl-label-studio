import { FiDatabase } from 'react-icons/fi';
import { version } from '../../../package.json';

export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:px-6 lg:px-8">
      <span>
        <span className="font-medium text-slate-700">ZPL Label Studio</span> · v{version}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <FiDatabase className="size-3.5" aria-hidden="true" />
        Printers, templates and history are saved in the database folder
      </span>
    </footer>
  );
}
