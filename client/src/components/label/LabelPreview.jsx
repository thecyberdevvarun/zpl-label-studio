import { FiAlertCircle, FiCode } from 'react-icons/fi';
import Button from '../ui/Button';

const MAX_W = 340;
const MAX_H = 260;

// Approximate on-screen view of the label. Positions come from the server — the same
// layout used to build the ZPL — so what you see here is where things print.
export default function LabelPreview({ serial, preview, onViewZpl }) {
  const { layout, loading, error } = preview;

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-slate-300 bg-white p-5 sm:flex-row sm:items-start">
      {layout ? <LabelCanvas serial={serial} layout={layout} dimmed={loading} /> : <LabelPlaceholder error={error} />}

      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <div className="font-mono text-xs text-slate-500">First label</div>
          <div className="break-all font-mono text-sm font-medium">{serial}</div>
        </div>
        {error && layout && (
          <p className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
          </p>
        )}
        {layout?.warnings.map((text) => (
          <p key={text} className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {text}
          </p>
        ))}
        <Button size="sm" icon={FiCode} onClick={onViewZpl} disabled={!layout}>
          View ZPL code
        </Button>
        <p className="text-xs text-slate-400">
          Preview is approximate. The printer renders the final label, and the text width is estimated.
        </p>
      </div>
    </div>
  );
}

function LabelPlaceholder({ error }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center border border-dashed border-slate-300 bg-slate-100 px-4 text-center font-mono text-xs text-slate-400"
      style={{ width: MAX_W * 0.8, height: MAX_H * 0.8 }}
    >
      {error || 'Loading preview…'}
    </div>
  );
}

function LabelCanvas({ serial, layout, dimmed }) {
  const { labelWidth: w, labelHeight: h, qr, text } = layout;
  const scale = Math.min(MAX_W / w, MAX_H / h);

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-slate-400 bg-white shadow-sm transition-opacity ${dimmed ? 'opacity-60' : ''}`}
      style={{ width: w * scale, height: h * scale }}
      aria-label={`Label preview for ${serial}`}
    >
      <svg
        viewBox={`0 0 ${qr.modules} ${qr.modules}`}
        shapeRendering="crispEdges"
        className="absolute"
        style={{ left: qr.x * scale, top: qr.y * scale, width: qr.dots * scale, height: qr.dots * scale }}
      >
        <path d={qr.path} fill="#000" />
      </svg>
      <span
        className="absolute whitespace-nowrap font-sans font-medium leading-none text-black"
        style={{
          left: text.x * scale,
          top: text.y * scale,
          fontSize: text.fontSize * 0.8 * scale,
          ...(text.blockWidth ? { width: text.blockWidth * scale, textAlign: 'right' } : {}),
        }}
      >
        {serial}
      </span>
    </div>
  );
}
