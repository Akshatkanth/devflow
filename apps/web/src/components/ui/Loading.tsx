import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}
