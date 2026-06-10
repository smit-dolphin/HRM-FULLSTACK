interface StatusConfig {
  label: string
  className: string
}

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'default'

const variantStyles: Record<Variant, string> = {
  success: 'bg-emerald-200/80 text-emerald-600',
  danger: 'bg-rose-200/80 text-rose-500',
  warning: 'bg-amber-200/80 text-amber-600',
  info: 'bg-sky-200/80 text-sky-600',
  default: 'bg-slate-200/80 text-slate-600',
}

interface StatusBadgeProps {
  label: string
  variant?: Variant
}

export function StatusBadge({ label, variant = 'default' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex min-w-[76px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${variantStyles[variant]}`}>
      {label}
    </span>
  )
}
