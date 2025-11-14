'use client';

import { useEffect, useState } from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Loader({ size = 'medium', className = '' }: LoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const sizeClasses = {
    small: 'loader-small',
    medium: 'loader-medium',
    large: 'loader-large',
  };

  return (
    <div className={`loader-container ${className}`}>
      <div className={`loader ${sizeClasses[size]}`}>
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
}
