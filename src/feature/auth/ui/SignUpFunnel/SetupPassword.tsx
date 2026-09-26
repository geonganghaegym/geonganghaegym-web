import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { PASSWORD_REGEXP, SignUpFormType } from '@/entity/auth';
import { Typography } from '@/shared/mixin';
import { PasswordInput } from '@/shared/ui';
import { cn } from '@/shared/utils';

export const SetupPassword = () => {
  const {
    register,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignUpFormType>();

  const passwordValue = watch('password');
  const passwordConfirmValue = watch('passwordConfirm');

  useEffect(() => {
    clearErrors('password');
    clearErrors('passwordConfirm');
  }, [passwordValue, passwordConfirmValue]);

  return (
    <div>
      <div className='mb-6 flex flex-col'>
        <label
          htmlFor='password'
          className={cn(Typography.TITLE_3, 'mb-3 text-gray-800')}>
          비밀번호
        </label>
        <PasswordInput
          id='password'
          className={errors.password && 'border-point focus:border-point'}
          value={passwordValue}
          clearValueButton={() => setValue('password', '')}
          placeholder='영문+숫자 조합 8자리 이상'
          {...register('password', {
            minLength: {
              value: 8,
              message: '비밀번호는 8글자 이상이어야 합니다',
            },
            pattern: {
              value: PASSWORD_REGEXP,
              message: '영문+숫자 조합 8자리 이상 입력해주세요.',
            },
          })}
        />
        {errors.password && (
          <p className={cn(Typography.BODY_4, 'mt-3 text-point')}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div className='mb-6 flex flex-col'>
        <label
          htmlFor='passwordConfirm'
          className={cn(Typography.TITLE_3, 'mb-3 text-gray-800')}>
          비밀번호 확인
        </label>
        <PasswordInput
          id='passwordConfirm'
          className={errors.passwordConfirm && 'border-point focus:border-point'}
          value={passwordConfirmValue}
          placeholder='비밀번호를 한 번 더 입력해주세요.'
          clearValueButton={() => setValue('passwordConfirm', '')}
          {...register('passwordConfirm', {
            validate: (value) =>
              value === passwordValue || '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
          })}
        />
        {errors.passwordConfirm && (
          <p className={cn(Typography.BODY_4, 'mt-3 text-point')}>
            {errors.passwordConfirm.message}
          </p>
        )}
      </div>
    </div>
  );
};
