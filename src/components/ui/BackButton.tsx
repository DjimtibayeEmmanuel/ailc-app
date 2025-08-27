'use client';

import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function BackButton({ href, onClick, children }: BackButtonProps) {
  if (href) {
    return (
      <Link href={href} className="btn btn-back">
        {children || '← Retour'}
      </Link>
    );
  }

  return (
    <button className="btn btn-back" onClick={onClick}>
      {children || '← Retour'}
    </button>
  );
}