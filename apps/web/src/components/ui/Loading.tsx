import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center text-muted-foreground/80 ${className}`}>
      <Loader2 className="animate-spin [animation-duration:0.9s]" size={size} />
    </div>
  );
}
