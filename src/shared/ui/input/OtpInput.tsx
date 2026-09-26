'use client';

import { OTPInput, OTPInputContext } from 'input-otp';
import { Dot } from 'lucide-react';
import * as React from 'react';
import { ComponentPropsWithoutRef, ElementRef, forwardRef, useContext } from 'react';

import { cn } from '@/shared/utils/tw-utils';

const InputOTP = forwardRef<
  ElementRef<typeof OTPInput>,
  ComponentPropsWithoutRef<typeof OTPInput> & {
    containerClassName?: string;
  }
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-disabled:opacity-50 h-[45px]',
      containerClassName
    )}
    style={{ width: '100%' }}
    className={cn('input-otp-override disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex w-full max-w-[320px] items-center justify-between', className)}
      {...props}
    />
  )
);
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  React.useEffect(() => {
    if (index === 0 && ref && 'current' in ref && ref.current) {
      (ref.current as HTMLElement).focus();
    }
  }, [index, ref]);

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2 relative flex h-[44px] w-[44px] items-center justify-center border-input text-sm transition-all',
        isActive && 'z-10 ring-2 ring-primary-500 ring-offset-primary-500',
        className
      )}
      {...props}>
      {char}
      {hasFakeCaret && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='animate-caret-blink h-8 w-px bg-foreground duration-1000' />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ ...props }, ref) => (
    <div ref={ref} role='separator' {...props}>
      <Dot />
    </div>
  )
);
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
