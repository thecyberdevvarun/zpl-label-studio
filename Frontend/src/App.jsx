import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PrinterProvider } from './context/PrinterContext';
import { StudioProvider } from './context/StudioContext';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import PrintPage from './pages/PrintPage';
import TemplatesPage from './pages/TemplatesPage';
import PrintersPage from './pages/PrintersPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <PrinterProvider>
        <StudioProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="print" element={<PrintPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="printers" element={<PrintersPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </StudioProvider>
      </PrinterProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{ className: '!text-sm !font-medium !text-slate-800 !shadow-lg', style: { borderRadius: '10px' } }}
      />
    </BrowserRouter>
  );
}
