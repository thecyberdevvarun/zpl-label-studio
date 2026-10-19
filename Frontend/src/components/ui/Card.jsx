// A white panel with an optional title row. The basic building block of every page.
export default function Card({ title, description, action, icon: Icon, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-900">{title}</h2>
              {description && <p className="truncate text-xs text-slate-500">{description}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
