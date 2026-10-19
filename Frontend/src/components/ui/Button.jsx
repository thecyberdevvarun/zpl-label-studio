const VARIANTS = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800',
  secondary: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50',
  danger: 'border border-slate-300 bg-white text-rose-600 shadow-sm hover:border-rose-300 hover:bg-rose-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'size-9',
};

// Use `as={Link} to="/somewhere"` to get a link that looks like a button.
export default function Button({ as: Component = 'button', variant = 'secondary', size = 'md', icon: Icon, children, className = '', ...props }) {
  const extra = Component === 'button' ? { type: 'button' } : {};
  return (
    <Component
      {...extra}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
      {children}
    </Component>
  );
}
