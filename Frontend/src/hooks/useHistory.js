import { useCallback, useEffect, useState } from 'react';
import * as db from '../api/databaseApi';

// Finished print jobs, newest first (database/history.json).
export default function useHistory() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    db.getHistory()
      .then((res) => setEntries(res.entries))
      .catch(() => {}); // history is a nice-to-have; the app works without it
  }, []);

  const addEntry = useCallback(async (entry) => {
    const res = await db.addHistoryEntry(entry);
    setEntries(res.entries);
  }, []);

  const clear = useCallback(async () => {
    const res = await db.clearHistory();
    setEntries(res.entries);
  }, []);

  return { entries, addEntry, clear };
}
