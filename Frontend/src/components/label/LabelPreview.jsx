import { FiAlertCircle, FiAlertTriangle, FiCode } from 'react-icons/fi';
import Button from '../ui/Button';

const MAX_W = 330;
const MAX_H = 250;
const TEXT_ALIGN = { L: 'left', C: 'center', R: 'right' };

// Approximate on-screen view of the label. Positions come from the server — the same
// layout used to build the ZPL — so what you see here is where things print.
export default function LabelPreview({ serial, preview, sizeText, onViewZpl }) {
  const { layout, loading, error } = preview;

  return (
    <div className="space-y-4">
      <div
        className="flex min-h-[200px] items-center justify-center rounded-lg bg-slate-200/70 p-5"
        style={{ backgroundImage: 'radial-gradient(circle, rgb(148 163 184 / 0.35) 1px, transparent 1px)', backgroundSize: '14px 14px' }}
      >
        {layout ? <LabelCanvas serial={serial} layout={layout} dimmed={loading} /> : <LabelPlaceholder error={error} />}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          Label size <span className="font-medium text-slate-700">{sizeText}</span>
        </span>
        <Button size="sm" icon={FiCode} onClick={onViewZpl} disabled={!layout}>
          ZPL code
        </Button>
      </div>

      {error && layout && (
        <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
      {layout?.warnings.map((text) => (
        <p key={text} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <FiAlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" /> {text}
        </p>
      ))}
      <p className="text-xs text-slate-400">Approximate. The printer renders the final label, and text width is estimated.</p>
    </div>
  );
}

function LabelPlaceholder({ error }) {
  return (
    <div className="flex h-40 w-64 items-center justify-center rounded border border-dashed border-slate-400 bg-white/60 px-4 text-center text-xs text-slate-500">
      {error || 'Loading preview…'}
    </div>
  );
}

function Text({ element, scale, children }) {
  return (
    <span
      className="absolute whitespace-nowrap font-sans font-medium leading-none text-black"
      style={{
        left: element.x * scale,
        top: element.y * scale,
        fontSize: element.fontSize * 0.8 * scale,
        ...(element.blockWidth ? { width: element.blockWidth * scale, textAlign: TEXT_ALIGN[element.align] } : {}),
      }}
    >
      {children}
    </span>
  );
}

function LabelCanvas({ serial, layout, dimmed }) {
  const { labelWidth: w, labelHeight: h, code, serial: serialText, custom } = layout;
  const scale = Math.min(MAX_W / w, MAX_H / h);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-slate-900/10 transition-opacity ${dimmed ? 'opacity-60' : ''}`}
      style={{ width: w * scale, height: h * scale }}
      aria-label={`Label preview for ${serialText ? serial : custom?.text}`}
    >
      {code && (
        <svg
          viewBox={`0 0 ${code.viewBox[0]} ${code.viewBox[1]}`}
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          className="absolute"
          style={{ left: code.x * scale, top: code.y * scale, width: code.width * scale, height: code.height * scale }}
        >
          <path d={code.path} fill="#000" />
        </svg>
      )}
      {serialText && (
        <Text element={serialText} scale={scale}>
          {serial}
        </Text>
      )}
      {custom && (
        <Text element={custom} scale={scale}>
          {custom.text}
        </Text>
      )}
    </div>
  );
}
