import React from 'react';

export default function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl border border-border bg-card flex items-center justify-center text-muted-foreground shadow-sm">
        <div className="w-5 h-5 rounded-md border border-current/30" />
      </div>
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        {description && <p className="text-muted-foreground text-sm mt-1 leading-relaxed max-w-sm mx-auto">{description}</p>}
      </div>
      {action}
    </div>
  );
}
