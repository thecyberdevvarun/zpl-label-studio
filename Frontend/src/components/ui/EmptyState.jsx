export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-slate-500">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
