import { Loader2, AlertTriangle } from 'lucide-react';

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-accent-cyan">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-warn-red/40 bg-warn-red/10 p-3 text-sm text-warn-red">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{error.message || String(error)}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="glass-card flex flex-col items-center gap-2 px-6 py-12 text-center">
      {Icon && <Icon className="h-8 w-8 text-accent-teal" />}
      <p className="font-medium">{title}</p>
      {children && <p className="text-sm text-text-primary/60">{children}</p>}
    </div>
  );
}
