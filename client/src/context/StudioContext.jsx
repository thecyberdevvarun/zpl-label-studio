import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usePrinterContext } from './PrinterContext';
import useSettings from '../hooks/useSettings';
import useTemplates from '../hooks/useTemplates';
import useHistory from '../hooks/useHistory';
import usePrintJob from '../hooks/usePrintJob';
import useLabelPreview from '../hooks/useLabelPreview';
import StatusScreen from '../components/layout/StatusScreen';
import { DEFAULT_DPI, DEFAULT_SETTINGS } from '../constants/defaults';
import { buildSerialRange, formatSerial } from '../utils/serial';
import { getLabelIssue } from '../utils/labelIssues';
import { MM_PER_INCH, sanitizeDelay, toPrintLabel, toSavedLabel, upgradeLabel } from '../utils/label';

const StudioContext = createContext(null);

// Everything about the label being designed and printed: the serial range, label settings,
// templates, the live preview, the running print job and the print history.
// Lives above the pages so a print job keeps running when you move between pages.
export function StudioProvider({ children }) {
  const { selected, setPollingPaused, loading: printersLoading, loadError, reloadPrinters } = usePrinterContext();
  const { settings, update, status: settingsStatus, error: settingsError, reload: reloadSettings } = useSettings();
  const { templates, saveTemplate, deleteTemplate, markPrinted } = useTemplates();
  const history = useHistory();
  const job = usePrintJob();
  const [activeTemplateId, setActiveTemplateId] = useState('');

  const { serial, label: labelSettings } = settings;
  const dpi = selected?.dpi || DEFAULT_DPI; // the label size (mm) becomes dots using this printer's resolution
  const label = toPrintLabel(labelSettings, dpi);
  const textOnly = label.codeType === 'text'; // prints just the custom text; no serial range
  const range = useMemo(() => buildSerialRange(serial.start, serial.end), [serial]);
  const rangeError = textOnly ? null : range.error;
  const previewSerial = textOnly ? label.customText || 'Text' : range.serials[0] || formatSerial(serial.start) || 'SN000001';
  const codeIssue = getLabelIssue(previewSerial, label); // e.g. lowercase letters in Code 39, or no text in text-only mode
  const preview = useLabelPreview(previewSerial, label, !codeIssue);

  const inches = labelSettings.sizeUnit === 'in';
  const sizeText = inches
    ? `${+(labelSettings.labelWidthMm / MM_PER_INCH).toFixed(2)} × ${+(labelSettings.labelHeightMm / MM_PER_INCH).toFixed(2)} in`
    : `${labelSettings.labelWidthMm} × ${labelSettings.labelHeightMm} mm`;

  // Don't poll the printer while a job is using the connection.
  useEffect(() => setPollingPaused(job.isRunning), [job.isRunning, setPollingPaused]);

  const changeSetting = useCallback(
    (key, value) => update((s) => ({ ...s, label: { ...s.label, [key]: value } })),
    [update],
  );

  // ── templates ──
  const saveCurrentAsTemplate = async (name) => {
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

  const applyTemplate = (id) => {
    setActiveTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    update({ serial: { start: t.start, end: t.end }, label: { ...DEFAULT_SETTINGS.label, ...upgradeLabel(t.label) } });
  };

  const removeTemplate = async (id) => {
    const name = templates.find((t) => t.id === id)?.name;
    try {
      await deleteTemplate(id);
      if (id === activeTemplateId) setActiveTemplateId('');
      toast(`Deleted template “${name}”`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── print ──
  const print = async () => {
    if (!selected) {
      toast.error('Add and select a printer first.');
      return;
    }
    if (rangeError || codeIssue) {
      toast.error(rangeError || codeIssue);
      return;
    }

    const serials = textOnly ? [label.customText] : range.serials; // text-only: one print, repeated by 'copies'
    const result = await job.run({
      printer: selected,
      serials,
      label,
      batchDelay: sanitizeDelay(labelSettings.batchDelay),
    });

    const templateName = templates.find((t) => t.id === activeTemplateId)?.name ?? '';
    if (activeTemplateId && result.lastSerial && !textOnly) {
      markPrinted(activeTemplateId, { start: serials[0], end: result.lastSerial }).catch((err) =>
        toast.error(`Could not update the template: ${err.message}`),
      );
    }

    const labelCount = result.printed * label.copies; // every serial prints 'copies' times
    history
      .addEntry({
        printer: selected.name,
        type: label.codeType,
        summary: textOnly
          ? label.customText
          : result.lastSerial && result.lastSerial !== serials[0]
            ? `${serials[0]} to ${result.lastSerial}`
            : serials[0],
        labels: labelCount,
        status: result.status,
        template: templateName,
      })
      .catch(() => {}); // not being able to save history must never look like a print failure

    const plural = labelCount === 1 ? '' : 's';
    if (result.status === 'done') toast.success(`${labelCount} label${plural} printed`);
    else if (result.status === 'stopped') toast(`Stopped after ${labelCount} label${plural}`);
    else toast.error(`Printing failed after ${labelCount} label${plural}. See the log.`);
  };

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

  const value = {
    // current label
    settings: labelSettings,
    serial,
    updateSettings: update,
    changeSetting,
    dpi,
    label,
    textOnly,
    range,
    rangeError,
    previewSerial,
    codeIssue,
    preview,
    sizeText,
    // templates
    templates,
    activeTemplateId,
    saveCurrentAsTemplate,
    applyTemplate,
    removeTemplate,
    // printing
    job,
    print,
    history: history.entries,
    clearHistory: history.clear,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside <StudioProvider>');
  return ctx;
}
