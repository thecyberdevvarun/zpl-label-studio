import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiSave, FiWifi } from 'react-icons/fi';
import { usePrinterContext } from '../../context/PrinterContext';
import { checkPrinter } from '../../api/printApi';
import { DEFAULT_DPI, DEFAULT_PRINTER_PORT, DPI_OPTIONS } from '../../constants/defaults';
import { parsePrinterAddress } from '../../utils/printerAddress';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Field, TextInput, inputClass } from '../ui/Field';

const EMPTY_FORM = { name: '', host: '', port: String(DEFAULT_PRINTER_PORT), dpi: String(DEFAULT_DPI) };

// Cleans the address box (spaces, "http://", ":9100", …) and checks the port.
// Returns { host, port, dpi } or { error }.
function validate(form) {
  const address = parsePrinterAddress(form.host);
  if (address.error) return { error: address.error };

  const port = address.port ?? Number(form.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { error: 'Port must be a number between 1 and 65535.' };
  }
  return { host: address.host, port, dpi: Number(form.dpi) || DEFAULT_DPI };
}

// Add a new printer, or edit `printer` when one is given.
export default function PrinterFormModal({ open, onClose, printer }) {
  const { addPrinter, updatePrinter } = usePrinterContext();
  const [form, setForm] = useState(EMPTY_FORM);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      printer
        ? { name: printer.name, host: printer.host, port: String(printer.port), dpi: String(printer.dpi || DEFAULT_DPI) }
        : EMPTY_FORM,
    );
  }, [open, printer]);

  // Live feedback while typing (nothing shown until something is typed).
  const typedAddress = form.host.trim() ? parsePrinterAddress(form.host) : null;
  const hostError = typedAddress?.error ?? '';
  const hostHint = typedAddress?.port ? `Port ${typedAddress.port} will be used.` : '';

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const checked = validate(form);
    if (checked.error) return toast.error(checked.error);

    const data = { name: form.name.trim() || checked.host, host: checked.host, port: checked.port, dpi: checked.dpi };
    setSaving(true);
    try {
      if (printer) {
        await updatePrinter(printer.id, data);
        toast.success(`Saved ${data.name}`);
      } else {
        await addPrinter(data);
        toast.success(`Added ${data.name}`);
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const handleTest = async () => {
    const checked = validate(form);
    if (checked.error) return toast.error(checked.error);
    setTesting(true);
    try {
      await checkPrinter({ host: checked.host, port: checked.port });
      toast.success(`Connected to ${checked.host}:${checked.port}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTesting(false);
    }
    return undefined;
  };

  return (
    <Modal open={open} onClose={onClose} title={printer ? 'Edit printer' : 'Add a printer'} width="max-w-lg">
      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Name" hint="Optional. Defaults to the address.">
          <TextInput value={form.name} onChange={setField('name')} placeholder="e.g. Packing line 2" />
        </Field>
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <Field label="IP address or hostname" error={hostError} hint={hostHint}>
            <TextInput className="font-mono" value={form.host} onChange={setField('host')} placeholder="e.g. 192.168.1.50" autoFocus />
          </Field>
          <Field label="Port">
            <TextInput className="font-mono" value={form.port} onChange={setField('port')} inputMode="numeric" />
          </Field>
        </div>
        <Field
          label="Print resolution"
          hint="Used to turn the label size (mm or inches) into printer dots. Check your printer's spec sheet; most label printers are 203 dpi."
        >
          <select value={form.dpi} onChange={setField('dpi')} className={inputClass}>
            {DPI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button type="submit" variant="primary" icon={printer ? FiSave : FiPlus} disabled={saving}>
            {printer ? 'Save changes' : 'Add printer'}
          </Button>
          <Button icon={FiWifi} onClick={handleTest} disabled={testing}>
            {testing ? 'Testing…' : 'Test connection'}
          </Button>
          <Button variant="ghost" onClick={onClose} className="ml-auto">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
