import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as db from '../api/databaseApi';

// Saved printers live on the server (database/printers.json).
// Shape: { id, name, host, port }. Every change is saved before the UI updates.
export default function usePrinters() {
  const [data, setData] = useState({ printers: [], selectedId: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apply = useCallback((res) => {
    setData({ printers: res.printers, selectedId: res.selectedId });
    return res;
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return db
      .getPrinters()
      .then(apply)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apply]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => data.printers.find((p) => p.id === data.selectedId) ?? data.printers[0] ?? null,
    [data],
  );

  // These return promises; callers show errors with a toast.
  const addPrinter = useCallback((printer) => db.createPrinter(printer).then(apply), [apply]);
  const updatePrinter = useCallback((id, printer) => db.updatePrinter(id, printer).then(apply), [apply]);
  const removePrinter = useCallback((id) => db.deletePrinter(id).then(apply), [apply]);

  const selectPrinter = useCallback(
    (id) => {
      setData((d) => ({ ...d, selectedId: id })); // instant, then saved
      return db.selectPrinter(id).then(apply).catch((err) => {
        toast.error(err.message);
        return load();
      });
    },
    [apply, load],
  );

  return {
    printers: data.printers,
    selected,
    loading,
    loadError: error,
    reloadPrinters: load,
    selectPrinter,
    addPrinter,
    updatePrinter,
    removePrinter,
  };
}
