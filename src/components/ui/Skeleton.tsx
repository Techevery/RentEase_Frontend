
import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rect' | 'circle';
  width?: number | string;
  height?: number | string;
}

const Skeleton = ({
  className = '',
  variant = 'rect',
  width,
  height,
  style,
  ...props
}: SkeletonProps) => {
  const baseClasses = 'bg-gray-200 animate-pulse rounded';
  const variantClasses = variant === 'circle' ? 'rounded-full' : 'rounded';

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        ...style,
      }}
      {...props}
    />
  );
};

export default Skeleton;