export default function Section({ title, action, children }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-mono text-sm font-semibold text-slate-700">{title}</h2>
        <div className="h-px flex-1 bg-slate-300" />
        {action}
      </div>
      {children}
    </section>
  );
}
