'use client';

import { FormEvent, forwardRef, InputHTMLAttributes, useState } from 'react';

import HidePasswordIcon from '@/shared/assets/images/icon_hide_password.svg';
import ShowPasswordIcon from '@/shared/assets/images/icon_show_password.svg';
import TextDeleteIcon from '@/shared/assets/images/icon_text_delete.svg';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn, twSelector } from '@/shared/utils';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasClear?: boolean;
  clearValueButton?: (e: FormEvent<HTMLButtonElement>) => void;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, value, clearValueButton, ...props }, inputRef) => {
    const [isShowPassword, setIsShowPassword] = useState(true);

    const handlePasswordIconClick = (e: FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsShowPassword((prev) => !prev);
    };

    return (
      <div className='relative flex h-[50px] w-full items-center'>
        <input
          ref={inputRef}
          type={isShowPassword ? 'password' : 'text'}
          className={cn(
            Typography.BODY_1,
            twSelector('placeholder', Typography.BODY_1),
            'h-full w-full rounded-md border border-solid border-gray-200 p-6 text-gray-800 outline-hidden placeholder:text-gray-500 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] focus:visible focus:border focus:border-primary-500',
            className
          )}
          {...props}
        />
        <Button
          className={cn(
            'absolute right-[55px] top-[50%] hidden h-auto w-auto translate-y-[-50%] bg-transparent p-0',
            {
              block: value !== '' && value !== undefined,
            }
          )}
          onClick={clearValueButton}>
          <TextDeleteIcon />
        </Button>
        <Button
          type='button'
          onClick={handlePasswordIconClick}
          variant='ghost'
          className='absolute right-7 p-0'>
          {isShowPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
