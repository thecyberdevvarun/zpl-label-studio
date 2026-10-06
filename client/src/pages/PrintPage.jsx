import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiLoader, FiPlus, FiPrinter, FiSquare } from 'react-icons/fi';
import { usePrinterContext } from '../context/PrinterContext';
import useSettings from '../hooks/useSettings';
import usePrintJob from '../hooks/usePrintJob';
import useTemplates from '../hooks/useTemplates';
import useLabelPreview from '../hooks/useLabelPreview';
import { DEFAULT_SETTINGS } from '../constants/defaults';
import { buildSerialRange, formatSerial } from '../utils/serial';
import { sanitizeDelay, sanitizeLabel, toSavedLabel } from '../utils/label';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import StatusScreen from '../components/layout/StatusScreen';
import SerialRangeForm from '../components/serial/SerialRangeForm';
import LabelSettings from '../components/label/LabelSettings';
import LabelPreview from '../components/label/LabelPreview';
import ZplModal from '../components/label/ZplModal';
import PrintMonitor from '../components/print/PrintMonitor';

export default function PrintPage() {
  const { selected, openManager, setPollingPaused, loading: printersLoading, loadError, reloadPrinters } =
    usePrinterContext();
  const { settings, update, status: settingsStatus, error: settingsError, reload: reloadSettings } = useSettings();
  const { templates, saveTemplate, deleteTemplate, markPrinted } = useTemplates();
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [zplOpen, setZplOpen] = useState(false);
  const job = usePrintJob();

  const { serial, label: labelSettings } = settings;
  const label = sanitizeLabel(labelSettings);
  const range = useMemo(() => buildSerialRange(serial.start, serial.end), [serial]);
  const previewSerial = range.serials[0] || formatSerial(serial.start) || 'SN000001';
  const preview = useLabelPreview(previewSerial, label);

  // Don't poll the printer while a job is using the connection.
  useEffect(() => setPollingPaused(job.isRunning), [job.isRunning, setPollingPaused]);

  // First visit: nothing can be printed until a printer exists.
  useEffect(() => {
    if (!printersLoading && !loadError && !selected) openManager();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printersLoading]);

  if (printersLoading || settingsStatus === 'loading') return <StatusScreen />;
  if (loadError || settingsStatus === 'error') {
    return (
      <StatusScreen
        error={loadError || settingsError}
        onRetry={() => {
          reloadPrinters();
          reloadSettings();
        }}
      />
    );
  }

  const changeSetting = (key, value) => update((s) => ({ ...s, label: { ...s.label, [key]: value } }));

  // ── templates ──
  const handleSaveTemplate = async (name) => {
    if (!name) return toast.error('Enter a template name first.');
    try {
      const saved = await saveTemplate({ name, start: serial.start, end: serial.end, label: toSavedLabel(labelSettings) });
      setActiveTemplateId(saved.id);
      toast.success(`Saved template “${name}”`);
    } catch (err) {
      toast.error(err.message);
    }
    return undefined;
  };

  const handleSelectTemplate = (id) => {
    setActiveTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    update({ serial: { start: t.start, end: t.end }, label: { ...DEFAULT_SETTINGS.label, ...t.label } });
  };

  const handleDeleteTemplate = async (id) => {
    const name = templates.find((t) => t.id === id)?.name;
    try {
      await deleteTemplate(id);
      setActiveTemplateId('');
      toast(`Deleted template “${name}”`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── print ──
  const handlePrint = async () => {
    if (!selected) {
      toast.error('Add and select a printer first.');
      openManager();
      return;
    }
    if (range.error) {
      toast.error(range.error);
      return;
    }

    const result = await job.run({
      printer: selected,
      serials: range.serials,
      label,
      batchDelay: sanitizeDelay(labelSettings.batchDelay),
    });

    if (activeTemplateId && result.lastSerial) {
      markPrinted(activeTemplateId, { start: range.serials[0], end: result.lastSerial }).catch((err) =>
        toast.error(`Could not update the template: ${err.message}`),
      );
    }
    const plural = result.printed === 1 ? '' : 's';
    if (result.status === 'done') toast.success(`${result.printed} label${plural} printed`);
    else if (result.status === 'stopped') toast(`Stopped after ${result.printed} label${plural}`);
    else toast.error(`Printing failed after ${result.printed} label${plural}. See the log.`);
  };

  const count = range.total ?? 0;

  return (
    <main className="mx-auto grid w-full max-w-[1500px] flex-1 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-10 border-slate-300 p-4 sm:p-8 lg:border-r lg:p-10">
        {!selected && (
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-amber-300 bg-amber-50 px-5 py-4">
            <FiAlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm text-amber-900">
              No printer yet. Add the IP address of your label printer to start printing.
            </p>
            <Button variant="primary" size="sm" icon={FiPlus} onClick={openManager}>
              Add a printer
            </Button>
          </div>
        )}

        <Section title="Serial range">
          <SerialRangeForm
            start={serial.start}
            end={serial.end}
            onStartChange={(start) => update((s) => ({ ...s, serial: { ...s.serial, start } }))}
            onEndChange={(end) => update((s) => ({ ...s, serial: { ...s.serial, end } }))}
            range={range}
            templateProps={{
              templates,
              activeId: activeTemplateId,
              onSelect: handleSelectTemplate,
              onSave: handleSaveTemplate,
              onDelete: handleDeleteTemplate,
            }}
          />
        </Section>

        <Section title="Label settings">
          <LabelSettings settings={labelSettings} onChange={changeSetting} />
        </Section>

        <Section title="Label preview">
          <LabelPreview serial={previewSerial} preview={preview} onViewZpl={() => setZplOpen(true)} />
        </Section>

        <div className="space-y-2">
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              icon={job.isRunning ? FiLoader : FiPrinter}
              disabled={job.isRunning || !selected || !!range.error}
              onClick={handlePrint}
            >
              {job.isRunning ? `Printing ${job.printed} of ${job.total}…` : `Print ${count || ''} label${count === 1 ? '' : 's'}`}
            </Button>
            {job.isRunning && (
              <Button variant="danger" size="lg" icon={FiSquare} onClick={job.stop}>
                Stop
              </Button>
            )}
          </div>
          {selected && (
            <p className="font-mono text-xs text-slate-500">
              Printing to {selected.name} ({selected.host}:{selected.port})
            </p>
          )}
        </div>
      </div>

      <aside className="p-4 sm:p-8">
        <PrintMonitor job={job} />
      </aside>

      <ZplModal open={zplOpen} onClose={() => setZplOpen(false)} zpl={preview.zpl} />
    </main>
  );
}
