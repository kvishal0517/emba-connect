import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Car } from 'lucide-react';

interface VehicleImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function VehicleImage({ src, alt, className }: VehicleImageProps) {
  const [error, setError] = useState(!src);

  React.useEffect(() => {
    setError(!src);
  }, [src]);

  if (error) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center border border-slate-200 ${className}`}>
        <div className="text-slate-300 flex flex-col items-center">
             <Car className="w-1/3 h-1/3 opacity-50" />
             <span className="text-xs font-medium uppercase mt-2 tracking-wider">No Image</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
}
