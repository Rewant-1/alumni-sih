'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const imageSizes = { sm: 32, md: 40, lg: 56, xl: 80 };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden bg-gray-100', sizes[size], className)}>
        <Image src={src} alt={alt || name || 'Avatar'} width={imageSizes[size]} height={imageSizes[size]} className="object-cover w-full h-full" />
      </div>
    );
  }

  if (name) {
    return (
      <div className={cn('rounded-full bg-[#001145] text-white font-bold flex items-center justify-center', sizes[size], className)}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={cn('rounded-full bg-gray-200 flex items-center justify-center', sizes[size], className)}>
      <User className="w-1/2 h-1/2 text-gray-400" />
    </div>
  );
}
