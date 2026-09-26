import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '../utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  progressClassName?: string;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, progressClassName, value, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative h-1 w-full overflow-hidden rounded-full bg-blue-600/20',
        className
      )}
      {...props}>
      <div
        className={cn(
          'h-full w-full flex-1 rounded-full bg-white transition-all',
          progressClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';

export { Progress };
