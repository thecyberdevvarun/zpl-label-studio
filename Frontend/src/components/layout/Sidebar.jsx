import { NavLink, Link } from 'react-router-dom';
import { FiClock, FiHome, FiLayers, FiPrinter, FiServer, FiTag } from 'react-icons/fi';
import { usePrinterContext } from '../../context/PrinterContext';
import StatusDot from './StatusDot';

const NAV = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/print', label: 'Print labels', icon: FiPrinter },
  { to: '/templates', label: 'Templates', icon: FiLayers },
  { to: '/printers', label: 'Printers', icon: FiServer },
  { to: '/history', label: 'History', icon: FiClock },
];

export default function Sidebar({ open, onClose }) {
  const { selected } = usePrinterContext();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 shadow-xl transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
            <FiTag className="size-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-white">ZPL Label Studio</div>
            <div className="text-xs text-slate-400">Label printing</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-indigo-400" />}
                  <Icon className={`size-[18px] ${isActive ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'}`} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <Link
            to="/printers"
            onClick={onClose}
            className="block rounded-lg bg-white/5 px-3.5 py-3 transition-colors hover:bg-white/10"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active printer</div>
            <div className="mt-1 truncate text-sm font-medium text-white">{selected ? selected.name : 'None selected'}</div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="truncate font-mono text-xs text-slate-400">{selected ? `${selected.host}:${selected.port}` : 'Add a printer'}</span>
              {selected && <StatusDot light />}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
