import { forwardRef, InputHTMLAttributes } from 'react';

import { cn } from '@/shared/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, inputRef) => {
    return (
      <input
        className={cn(
          'outline-hidden autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]',
          className
        )}
        type={type}
        ref={inputRef}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
