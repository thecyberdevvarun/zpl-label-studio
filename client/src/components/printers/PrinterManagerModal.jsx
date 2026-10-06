import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiEdit2, FiPlus, FiSave, FiTrash2, FiWifi } from 'react-icons/fi';
import { usePrinterContext } from '../../context/PrinterContext';
import { checkPrinter } from '../../api/printApi';
import { DEFAULT_PRINTER_PORT } from '../../constants/defaults';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Field, TextInput } from '../ui/Field';

const EMPTY_FORM = { name: '', host: '', port: String(DEFAULT_PRINTER_PORT) };
const HOST_RE = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/;

function validate({ host, port }) {
  if (!HOST_RE.test(host.trim())) return 'Enter an IP address or hostname, like 192.168.1.50.';
  const p = Number(port);
  if (!Number.isInteger(p) || p < 1 || p > 65535) return 'Port must be a number between 1 and 65535.';
  return null;
}

export default function PrinterManagerModal() {
  const { managerOpen, closeManager, printers, selected, selectPrinter, addPrinter, updatePrinter, removePrinter } =
    usePrinterContext();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!managerOpen) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }, [managerOpen]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, host: p.host, port: String(p.port) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const error = validate(form);
    if (error) return toast.error(error);

    const data = { name: form.name.trim() || form.host.trim(), host: form.host.trim(), port: Number(form.port) };
    try {
      if (editingId) {
        await updatePrinter(editingId, data);
        toast.success(`Saved ${data.name}`);
      } else {
        await addPrinter(data);
        toast.success(`Added ${data.name}`);
      }
      resetForm();
    } catch (err) {
      toast.error(err.message);
    }
    return undefined;
  };

  const handleTest = async () => {
    const error = validate(form);
    if (error) return toast.error(error);
    setTesting(true);
    try {
      await checkPrinter({ host: form.host.trim(), port: Number(form.port) });
      toast.success(`Connected to ${form.host.trim()}:${form.port}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTesting(false);
    }
    return undefined;
  };

  const handleRemove = async (p) => {
    if (!window.confirm(`Remove ${p.name}?`)) return;
    try {
      await removePrinter(p.id);
      if (editingId === p.id) resetForm();
      toast(`Removed ${p.name}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={managerOpen} onClose={closeManager} title="Printers">
      {printers.length > 0 && (
        <ul className="mb-6 divide-y divide-slate-200 rounded-md border border-slate-300">
          {printers.map((p) => {
            const isSelected = selected?.id === p.id;
            return (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-sm font-medium">{p.name}</div>
                  <div className="font-mono text-xs text-slate-500">
                    {p.host}:{p.port}
                  </div>
                </div>
                {isSelected ? (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-600">
                    <FiCheck aria-hidden="true" /> In use
                  </span>
                ) : (
                  <Button size="sm" onClick={() => selectPrinter(p.id)}>
                    Use
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`}>
                  <FiEdit2 />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(p)} aria-label={`Remove ${p.name}`}>
                  <FiTrash2 />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <h3 className="font-mono text-sm font-semibold text-slate-700">
          {editingId ? 'Edit printer' : printers.length ? 'Add another printer' : 'Add your first printer'}
        </h3>
        <Field label="Name" hint="Optional. Defaults to the address.">
          <TextInput value={form.name} onChange={setField('name')} placeholder="Packing line 2" />
        </Field>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Field label="IP address or hostname">
            <TextInput value={form.host} onChange={setField('host')} placeholder="192.168.1.50" autoFocus />
          </Field>
          <Field label="Port">
            <TextInput value={form.port} onChange={setField('port')} inputMode="numeric" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" icon={editingId ? FiSave : FiPlus}>
            {editingId ? 'Save changes' : 'Add printer'}
          </Button>
          <Button icon={FiWifi} onClick={handleTest} disabled={testing}>
            {testing ? 'Testing…' : 'Test connection'}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-400">Printers are saved in the database folder, so everyone using this app sees the same list.</p>
      </form>
    </Modal>
  );
}
