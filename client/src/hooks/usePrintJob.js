import { useCallback, useRef, useState } from 'react';
import { printLabel } from '../api/printApi';
import { createId } from '../utils/id';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const IDLE = { status: 'idle', total: 0, printed: 0, errors: 0 };

// Prints serials one at a time so progress is live and the job can be stopped.
// A printer error stops the job so a bad connection isn't hammered 500 times.
export default function usePrintJob() {
  const [state, setState] = useState(IDLE);
  const [logs, setLogs] = useState([]);
  const stopRequested = useRef(false);

  const addLog = useCallback((type, badge, message, serial = '') => {
    const time = new Date().toTimeString().slice(0, 8);
    setLogs((list) => [...list, { id: createId(), type, badge, message, serial, time }]);
  }, []);

  const run = useCallback(
    async ({ printer, serials, label, batchDelay }) => {
      stopRequested.current = false;
      setState({ status: 'running', total: serials.length, printed: 0, errors: 0 });
      addLog('info', 'JOB', `Started — ${serials.length} label${serials.length > 1 ? 's' : ''} on ${printer.name}`);

      let printed = 0;
      let errors = 0;
      let stopped = false;
      let lastSerial = null;

      for (let i = 0; i < serials.length; i++) {
        if (stopRequested.current) {
          stopped = true;
          addLog('info', 'STOP', 'Stopped by you');
          break;
        }
        const serial = serials[i];
        try {
          await printLabel(printer, serial, label);
          printed++;
          lastSerial = serial;
          setState((s) => ({ ...s, printed }));
          addLog('success', 'OK', 'Sent to printer', serial);
        } catch (err) {
          errors++;
          setState((s) => ({ ...s, errors }));
          addLog('error', 'ERR', err.message, serial);
          break;
        }
        if (i < serials.length - 1 && batchDelay > 0) await sleep(batchDelay);
      }

      const status = errors ? 'failed' : stopped ? 'stopped' : 'done';
      setState((s) => ({ ...s, status }));
      if (status === 'done') addLog('info', 'DONE', `Finished — ${printed} label${printed > 1 ? 's' : ''} printed`);
      return { status, printed, errors, lastSerial };
    },
    [addLog],
  );

  const stop = useCallback(() => {
    stopRequested.current = true;
  }, []);

  const clear = useCallback(() => {
    setLogs([]);
    setState(IDLE);
  }, []);

  return { ...state, logs, run, stop, clear, isRunning: state.status === 'running' };
}
