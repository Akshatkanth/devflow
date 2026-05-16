import React from 'react';
import { XCircle } from 'lucide-react';

export default function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-6 text-sm text-red-400 bg-red-500/6 rounded-md border border-red-500/20 px-4">
      <div className="flex items-center justify-center gap-2">
        <XCircle size={16} />
        <div>{children}</div>
      </div>
    </div>
  );
}
