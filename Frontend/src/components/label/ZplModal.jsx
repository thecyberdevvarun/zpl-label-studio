import toast from 'react-hot-toast';
import { FiCopy } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ZplModal({ open, onClose, zpl }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(zpl);
      toast.success('ZPL copied');
    } catch {
      toast.error('Could not copy. Select the text and copy it manually.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ZPL for the first label" width="max-w-lg">
      <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-300">
        {zpl}
      </pre>
      <div className="mt-4">
        <Button size="sm" icon={FiCopy} onClick={copy}>
          Copy
        </Button>
      </div>
    </Modal>
  );
}
