'use client';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ message = 'Chargement...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`loading ${sizeClasses[size]}`}>
      <div className="loading-spinner"></div>
      <span>{message}</span>
    </div>
  );
}