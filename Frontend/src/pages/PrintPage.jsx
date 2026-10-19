import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiEye, FiHash, FiLayers, FiLayout, FiLoader, FiMaximize, FiPlus, FiPrinter, FiSquare, FiType } from 'react-icons/fi';
import { usePrinterContext } from '../context/PrinterContext';
import { useStudio } from '../context/StudioContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import TemplateManager from '../components/serial/TemplateManager';
import SerialRangeForm from '../components/serial/SerialRangeForm';
import ContentSettings from '../components/label/ContentSettings';
import LayoutSettings from '../components/label/LayoutSettings';
import SizeSettings from '../components/label/SizeSettings';
import LabelPreview from '../components/label/LabelPreview';
import ZplModal from '../components/label/ZplModal';
import PrintMonitor from '../components/print/PrintMonitor';

export default function PrintPage() {
  const { selected } = usePrinterContext();
  const studio = useStudio();
  const { settings, changeSetting, serial, updateSettings, range, textOnly, rangeError, codeIssue, job } = studio;
  const [zplOpen, setZplOpen] = useState(false);

  const count = textOnly ? studio.label.copies : (range.total ?? 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0 space-y-6">
        {!selected && (
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <FiAlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm text-amber-900">
              No printer yet. Add the IP address of your label printer to start printing.
            </p>
            <Button as={Link} to="/printers" state={{ add: true }} variant="primary" size="sm" icon={FiPlus}>
              Add a printer
            </Button>
          </div>
        )}

        <Card title="Templates" icon={FiLayers} description="Reuse a saved setup, or save this one">
          <TemplateManager
            templates={studio.templates}
            activeId={studio.activeTemplateId}
            onSelect={studio.applyTemplate}
            onSave={studio.saveCurrentAsTemplate}
            onDelete={studio.removeTemplate}
          />
        </Card>

        <Card title="Serial range" icon={FiHash} description="The numbers to print, one label each">
          <SerialRangeForm
            start={serial.start}
            end={serial.end}
            onStartChange={(start) => updateSettings((s) => ({ ...s, serial: { ...s.serial, start } }))}
            onEndChange={(end) => updateSettings((s) => ({ ...s, serial: { ...s.serial, end } }))}
            range={range}
            textOnly={textOnly}
          />
        </Card>

        <Card title="Content" icon={FiType} description="What is printed on the label">
          <ContentSettings settings={settings} onChange={changeSetting} codeIssue={codeIssue} />
        </Card>

        <Card title="Layout" icon={FiLayout} description="Where everything sits on the label">
          <LayoutSettings settings={settings} onChange={changeSetting} />
        </Card>

        <Card title="Label size and printing" icon={FiMaximize} description="The size of your label stock">
          <SizeSettings settings={settings} onChange={changeSetting} dpi={studio.dpi} printerName={selected?.name} />
        </Card>
      </div>

      <div className="min-w-0 xl:sticky xl:top-24 xl:-m-1 xl:max-h-[calc(100vh-7.5rem)] xl:self-start xl:overflow-y-auto xl:p-1">
        <div className="space-y-6">
          <Card title="Label preview" icon={FiEye} description="Updates as you change settings">
            <LabelPreview
              serial={studio.previewSerial}
              preview={studio.preview}
              sizeText={studio.sizeText}
              onViewZpl={() => setZplOpen(true)}
            />
          </Card>

          <Card>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  icon={job.isRunning ? FiLoader : FiPrinter}
                  disabled={job.isRunning || !selected || !!rangeError || !!codeIssue}
                  onClick={studio.print}
                >
                  {job.isRunning ? `Printing ${job.printed} of ${job.total}…` : count ? `Print ${count} label${count === 1 ? '' : 's'}` : 'Print labels'}
                </Button>
                {job.isRunning && (
                  <Button variant="danger" size="lg" icon={FiSquare} onClick={job.stop}>
                    Stop
                  </Button>
                )}
              </div>
              {selected ? (
                <p className="text-center text-xs text-slate-500">
                  Printing to <span className="font-medium text-slate-700">{selected.name}</span>{' '}
                  <span className="font-mono">
                    ({selected.host}:{selected.port})
                  </span>
                </p>
              ) : (
                <p className="text-center text-xs text-slate-500">Add and select a printer to enable printing.</p>
              )}
            </div>
          </Card>

          <PrintMonitor job={job} />
        </div>
      </div>

      <ZplModal open={zplOpen} onClose={() => setZplOpen(false)} zpl={studio.preview.zpl} />
    </div>
  );
}
