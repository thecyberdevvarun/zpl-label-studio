import { FiAlertCircle, FiLoader, FiRefreshCw } from 'react-icons/fi';
import Button from '../ui/Button';

// Full-area message shown while saved data loads, or when the server can't be reached.
export default function StatusScreen({ error, onRetry }) {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      {error ? (
        <div className="max-w-md space-y-4 text-center" role="alert">
          <FiAlertCircle className="mx-auto size-8 text-red-500" aria-hidden="true" />
          <p className="font-mono text-sm font-semibold">Could not load your saved data</p>
          <p className="text-sm text-slate-600">{error}</p>
          <Button variant="primary" icon={FiRefreshCw} onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 font-mono text-sm text-slate-500">
          <FiLoader className="size-4 animate-spin" aria-hidden="true" /> Loading…
        </div>
      )}
    </main>
  );
}
