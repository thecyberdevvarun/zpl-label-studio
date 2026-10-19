import { createContext, useContext, useState } from 'react';
import usePrinters from '../hooks/usePrinters';
import usePrinterStatus from '../hooks/usePrinterStatus';

const PrinterContext = createContext(null);

// Holds the saved printers, which one is selected, and its live status —
// shared by the sidebar, top bar and every page.
export function PrinterProvider({ children }) {
  const store = usePrinters();
  const [pollingPaused, setPollingPaused] = useState(false);
  const status = usePrinterStatus(store.selected, pollingPaused);

  return <PrinterContext.Provider value={{ ...store, ...status, setPollingPaused }}>{children}</PrinterContext.Provider>;
}

export function usePrinterContext() {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error('usePrinterContext must be used inside <PrinterProvider>');
  return ctx;
}
