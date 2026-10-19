import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiClock, FiLayers, FiMaximize, FiPrinter, FiTrash2 } from 'react-icons/fi';
import { useStudio } from '../context/StudioContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { upgradeLabel } from '../utils/label';
import { formatSerial } from '../utils/serial';
import { CODE_TYPE_NAMES } from '../utils/format';

function describe(template) {
  const label = upgradeLabel(template.label);
  const textOnly = label.codeType === 'text';
  return {
    type: CODE_TYPE_NAMES[label.codeType ?? 'qr'],
    size: `${label.labelWidthMm ?? 50} × ${label.labelHeightMm ?? 40} mm`,
    detail: textOnly ? label.customText || 'Text only' : `${formatSerial(template.start)} to ${formatSerial(template.end)}`,
    custom: !textOnly && label.customText ? label.customText : '',
  };
}

export default function TemplatesPage() {
  const { templates, applyTemplate, removeTemplate } = useStudio();
  const navigate = useNavigate();

  const use = (id) => {
    applyTemplate(id);
    navigate('/print');
  };

  const remove = (t) => {
    if (window.confirm(`Delete the template “${t.name}”?`)) removeTemplate(t.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Templates</h2>
          <p className="mt-1 text-sm text-slate-500">Saved label setups. Load one to print with the same design again.</p>
        </div>
        <Button as={Link} to="/print" icon={FiPrinter}>
          Design a new label
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card bodyClassName="p-0">
          <EmptyState
            icon={FiLayers}
            title="No templates yet"
            action={
              <Button as={Link} to="/print" variant="primary" icon={FiPrinter}>
                Design a label
              </Button>
            }
          >
            Design a label on the Print page, then use “Save as a template” to keep it here.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => {
            const d = describe(t);
            return (
              <Card key={t.id} bodyClassName="p-5 space-y-4" className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-base font-semibold text-slate-900" title={t.name}>
                    {t.name}
                  </h3>
                  <Badge tone="indigo">{d.type}</Badge>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiMaximize className="size-4 text-slate-400" aria-hidden="true" />
                    <dt className="sr-only">Size</dt>
                    <dd>{d.size}</dd>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <FiPrinter className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <dt className="sr-only">Content</dt>
                    <dd className="min-w-0">
                      <span className="block truncate font-mono text-xs">{d.detail}</span>
                      {d.custom && <span className="block truncate text-xs text-slate-400">Text: {d.custom}</span>}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <FiClock className="size-4 text-slate-400" aria-hidden="true" />
                    <dt className="sr-only">Last printed</dt>
                    <dd className="truncate text-xs">
                      {t.lastPrinted ? `Last printed ${t.lastPrinted.start} to ${t.lastPrinted.end}` : 'Not printed yet'}
                    </dd>
                  </div>
                </dl>
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <Button variant="primary" size="sm" icon={FiArrowRight} className="flex-1" onClick={() => use(t.id)}>
                    Use template
                  </Button>
                  <Button variant="danger" size="icon" onClick={() => remove(t)} aria-label={`Delete ${t.name}`}>
                    <FiTrash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
