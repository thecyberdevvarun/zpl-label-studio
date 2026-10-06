const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600',
  danger: 'border border-slate-300 bg-white text-red-600 hover:border-red-500 hover:bg-red-50',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
};

const SIZES = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
  icon: 'size-9 text-base',
};

export default function Button({ variant = 'secondary', size = 'md', icon: Icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md font-mono font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}
