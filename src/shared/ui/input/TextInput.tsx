import { FormEvent, forwardRef, InputHTMLAttributes } from 'react';

import TextDeleteIcon from '@/shared/assets/images/icon_text_delete.svg';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn, twSelector } from '@/shared/utils/tw-utils';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: string;
  containerClassName?: string;
  clearValueButton?: (e: FormEvent<HTMLButtonElement>) => void;
  isEmailVerified?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      type,
      defaultValue,
      className,
      containerClassName,
      value,
      clearValueButton,
      isEmailVerified,
      ...props
    },
    inputRef
  ) => {
    return (
      <div className={cn('relative', containerClassName)}>
        <input
          className={cn(
            Typography.BODY_1,
            twSelector('placeholder', Typography.BODY_1),
            'h-full w-full rounded-md border border-solid border-gray-200 p-6 text-gray-800 outline-hidden placeholder:text-gray-500 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] focus:visible focus:border focus:border-primary-500 disabled:bg-gray-100 disabled:shadow-gray-100',
            className
          )}
          type={type ?? 'text'}
          defaultValue={defaultValue}
          disabled={isEmailVerified}
          ref={inputRef}
          {...props}
        />
        {!isEmailVerified && (
          <Button
            type='button'
            className={cn(
              'absolute right-6 top-[50%] hidden h-auto w-auto translate-y-[-50%] bg-transparent p-0',
              {
                block: value !== '' && value !== undefined,
              }
            )}
            onClick={clearValueButton}>
            <TextDeleteIcon />
          </Button>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
