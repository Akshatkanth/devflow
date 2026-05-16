import React from 'react';

export default function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {/* decorative */}
      </div>
      <div>
        <h2 className="font-semibold text-lg">{title}</h2>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
