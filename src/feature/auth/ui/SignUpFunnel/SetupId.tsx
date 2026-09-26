import { FormEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import { ID_REGEXP, SignUpFormType } from '@/entity/auth';
import { Typography } from '@/shared/mixin';
import { Button, TextInput } from '@/shared/ui';
import { cn } from '@/shared/utils';

interface Props {
  idSuccessMsg: string;
  handleIsIdAvailable: (e: FormEvent<HTMLButtonElement>) => void;
  isPending: boolean;
}
export const SetupId = ({ idSuccessMsg, isPending, handleIsIdAvailable }: Props) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SignUpFormType>();

  const userIdValue = watch('userId');

  return (
    <div className='mb-6 flex flex-col'>
      <label htmlFor='id' className={cn(Typography.TITLE_3, 'mb-3 text-gray-800')}>
        아이디
      </label>
      <div className='flex items-center justify-between'>
        <TextInput
          id='userId'
          containerClassName='h-[50px] w-[calc(100%-76px-6px)]'
          className={
            (errors.userId && 'border-point focus:border-point') ??
            (idSuccessMsg && 'border-primary-500')
          }
          value={userIdValue}
          placeholder='아이디를 입력해주세요'
          clearValueButton={() => setValue('userId', '')}
          {...register('userId', {
            pattern: {
              value: ID_REGEXP,
              message: '영문, 숫자 4자리 이상 입력해주세요.',
            },
          })}
        />
        <Button
          type='button'
          className={cn(Typography.HEADING_5, 'h-[50px] w-[76px] rounded-md')}
          onClick={handleIsIdAvailable}
          disabled={isPending}>
          중복 확인
        </Button>
      </div>

      {errors.userId && (
        <p className={cn(Typography.BODY_4, 'mt-3 text-point')}>
          {errors.userId.message}
        </p>
      )}
      {idSuccessMsg && (
        <p className={cn(Typography.BODY_4, 'mt-3 text-primary-500')}>{idSuccessMsg}</p>
      )}
    </div>
  );
};
