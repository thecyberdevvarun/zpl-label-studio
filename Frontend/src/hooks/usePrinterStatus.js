import { useEffect, useState } from 'react';
import { checkPrinter } from '../api/printApi';
import { POLL_INTERVAL_MS } from '../constants/defaults';

// Checks whether the selected printer accepts connections.
// status: 'unknown' | 'checking' | 'online' | 'offline'
export default function usePrinterStatus(printer, paused = false) {
  const [status, setStatus] = useState('unknown');
  const [statusError, setStatusError] = useState('');
  const [tick, setTick] = useState(0);

  const host = printer?.host;
  const port = printer?.port;

  useEffect(() => {
    if (!host) {
      setStatus('unknown');
      setStatusError('');
      return undefined;
    }
    if (paused) return undefined; // don't compete with a running print job for the connection

    const controller = new AbortController();
    const run = async () => {
      setStatus('checking');
      try {
        await checkPrinter({ host, port }, controller.signal);
        if (controller.signal.aborted) return;
        setStatus('online');
        setStatusError('');
      } catch (err) {
        if (controller.signal.aborted) return;
        setStatus('offline');
        setStatusError(err.message);
      }
    };

    run();
    const timer = setInterval(run, POLL_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [host, port, paused, tick]);

  return { status, statusError, refreshStatus: () => setTick((t) => t + 1) };
}
