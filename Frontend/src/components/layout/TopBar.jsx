import { useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import PrinterSelector from './PrinterSelector';

const TITLES = [
  ['/print', 'Print labels'],
  ['/templates', 'Templates'],
  ['/printers', 'Printers'],
  ['/history', 'History'],
  ['/', 'Dashboard'],
];

export function pageTitle(pathname) {
  const match = TITLES.find(([path]) => (path === '/' ? pathname === '/' : pathname.startsWith(path)));
  return match ? match[1] : 'Page not found';
}

export default function TopBar({ onMenu }) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <FiMenu className="size-5" />
        </button>
        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">{pageTitle(pathname)}</h1>
      </div>
      <PrinterSelector />
    </header>
  );
}
