import { Toaster } from 'react-hot-toast';
import { PrinterProvider } from './context/PrinterContext';
import Header from './components/layout/Header';
import PrinterManagerModal from './components/printers/PrinterManagerModal';
import PrintPage from './pages/PrintPage';

export default function App() {
  return (
    <PrinterProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <PrintPage />
      </div>
      <PrinterManagerModal />
      <Toaster position="bottom-right" toastOptions={{ className: '!font-mono !text-sm' }} />
    </PrinterProvider>
  );
}
