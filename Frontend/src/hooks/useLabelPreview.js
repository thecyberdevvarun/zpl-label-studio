import { useEffect, useState } from 'react';
import { previewZpl } from '../api/printApi';

// Asks the server for the ZPL and layout of one label. The server is the single
// source of truth, so the preview always matches what gets printed.
export default function useLabelPreview(serial, label, enabled = true) {
  const [state, setState] = useState({ zpl: '', layout: null, error: '', loading: true });
  const key = JSON.stringify([serial, label, enabled]);

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, loading: false, error: '' }));
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    const timer = setTimeout(() => {
      previewZpl(serial, label)
        .then((data) => !cancelled && setState({ zpl: data.zpl, layout: data.layout, error: '', loading: false }))
        .catch((err) => !cancelled && setState((s) => ({ ...s, error: err.message, loading: false })));
    }, 200); // wait while a slider is being dragged or a field is being typed in
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
