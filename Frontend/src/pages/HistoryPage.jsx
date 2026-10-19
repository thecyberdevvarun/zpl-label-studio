import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiPrinter, FiTrash2 } from 'react-icons/fi';
import { useStudio } from '../context/StudioContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import JobsTable from '../components/history/JobsTable';
import { plural } from '../utils/format';

export default function HistoryPage() {
  const { history, clearHistory } = useStudio();

  const clear = async () => {
    if (!window.confirm('Clear the whole print history? This cannot be undone.')) return;
    try {
      await clearHistory();
      toast('History cleared');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const total = history.reduce((sum, e) => sum + e.labels, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">History</h2>
          <p className="mt-1 text-sm text-slate-500">
            {history.length
              ? `${plural(history.length, 'print job')}, ${plural(total, 'label')} in total. The latest 500 jobs are kept.`
              : 'Every print job you run is recorded here.'}
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="danger" icon={FiTrash2} onClick={clear}>
            Clear history
          </Button>
        )}
      </div>

      <Card bodyClassName="p-0">
        {history.length ? (
          <JobsTable entries={history} />
        ) : (
          <EmptyState
            icon={FiClock}
            title="Nothing printed yet"
            action={
              <Button as={Link} to="/print" variant="primary" icon={FiPrinter}>
                Print labels
              </Button>
            }
          >
            When you print, each job appears here with the printer, how many labels were sent and the result.
          </EmptyState>
        )}
      </Card>
    </div>
  );
}
