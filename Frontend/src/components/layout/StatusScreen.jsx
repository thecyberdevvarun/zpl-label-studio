import { FiAlertCircle, FiLoader, FiRefreshCw } from 'react-icons/fi';
import Button from '../ui/Button';

// Full-screen message shown while saved data loads, or when the server can't be reached.
export default function StatusScreen({ error, onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
      {error ? (
        <div className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm" role="alert">
          <FiAlertCircle className="mx-auto size-9 text-rose-500" aria-hidden="true" />
          <p className="text-base font-semibold text-slate-900">Could not load your saved data</p>
          <p className="text-sm text-slate-600">{error}</p>
          <Button variant="primary" icon={FiRefreshCw} onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <FiLoader className="size-5 animate-spin text-indigo-600" aria-hidden="true" /> Loading…
        </div>
      )}
    </div>
  );
}
