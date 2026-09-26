'use client';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { EMAIL_REGEXP, NAME_REGEXP, SocialIcon, socialProviders } from '@/entity/auth';
import { useFindIdMutation } from '@/feature/auth';
import { FindIdRequest, FindIdResponse } from '@/feature/manage';
import { IconClose } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, Input, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const FindIdPage = () => {
  const router = useRouter();
  const { errorToast } = useToast();
  const [completed, setCompleted] = useState<FindIdResponse | null>(null);

  const { mutate } = useFindIdMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FindIdRequest>({
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<FindIdRequest> = (form) => {
    mutate(form, {
      onSuccess: ({ data }) => {
        setCompleted(data);
      },
      onError: (error) => {
        const message = error?.response?.data.message;
        errorToast(message);
      },
    });
  };

  return (
    <Layout className='bg-white'>
      <Layout.Header className='flex w-full items-center justify-end'>
        <Button variant='ghost' onClick={() => router.back()}>
          <IconClose width={14} height={14} />
        </Button>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          아이디 찾기
        </h1>
      </Layout.Header>
      {!completed && (
        <>
          <Layout.Contents>
            <form id='find-id' className='flex flex-col gap-8 p-7'>
              <div className='flex flex-col gap-3'>
                <label htmlFor='name' className={cn(Typography.TITLE_3)}>
                  이름을 입력해주세요.
                </label>
                <div
                  className={cn(
                    'flex rounded-md border border-gray-200 px-6 py-[13px]',
                    errors.name && 'border-point'
                  )}>
                  <Input
                    id='name'
                    placeholder='이름 입력'
                    className={cn(
                      Typography.BODY_1,
                      'bg-transparent placeholder:text-gray-500'
                    )}
                    {...register('name', {
                      required: {
                        value: true,
                        message: '이름을 입력해주세요.',
                      },
                      pattern: {
                        value: NAME_REGEXP,
                        message: '한글 또는 영문만 입력해주세요',
                      },
                    })}
                  />
                </div>
                {errors.name && (
                  <span className={cn(Typography.BODY_4_MEDIUM, 'text-point')}>
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div className='flex flex-col gap-3'>
                <label htmlFor='email' className={cn(Typography.TITLE_3)}>
                  가입한 이메일 주소를 입력해주세요.
                </label>
                <div
                  className={cn(
                    'flex rounded-md border border-gray-200 px-6 py-[13px]',
                    errors.email && 'border-point'
                  )}>
                  <Input
                    id='email'
                    type='email'
                    placeholder='이메일 주소 입력'
                    className={cn(
                      Typography.BODY_1,
                      'bg-transparent placeholder:text-gray-500'
                    )}
                    {...register('email', {
                      required: {
                        value: true,
                        message: '이메일을 입력해주세요.',
                      },
                      pattern: {
                        value: EMAIL_REGEXP,
                        message: '이메일 형식이 아닙니다.',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <span className={cn(Typography.BODY_4_MEDIUM, 'text-point')}>
                    {errors.email.message}
                  </span>
                )}
              </div>
            </form>
          </Layout.Contents>
          <Layout.BottomArea>
            <Button
              formTarget='find-id'
              variant='default'
              type='submit'
              size='full'
              className={cn(Typography.TITLE_1_BOLD)}
              disabled={!isValid}
              onClick={handleSubmit(onSubmit)}>
              이메일 전송하기
            </Button>
          </Layout.BottomArea>
        </>
      )}
      {completed && completed.socialType === 'NONE' && (
        <>
          <Layout.Contents className='px-7'>
            <div className='mt-[96px] flex flex-col gap-3 rounded-lg bg-blue-50 p-6 py-10 text-center'>
              <p className={cn(Typography.HEADING_4_BOLD, 'text-primary')}>
                {completed.userId}
              </p>
              <p className={cn(Typography.BODY_1, 'text-gray-700')}>
                가입일자: {dayjs(completed.createdAt).format('YYYY.MM.DD')}
              </p>
            </div>
            <p
              className={cn(
                Typography.BODY_3,
                'mx-auto mt-7 w-[160px] whitespace-pre-wrap break-keep text-center text-gray-500'
              )}>
              개인정보보호를 위해 아이디 중 일부는 *로 표기됩니다.
            </p>
          </Layout.Contents>
          <Layout.BottomArea>
            <Button
              variant='default'
              size='full'
              className={cn(Typography.TITLE_1_BOLD)}
              onClick={() => router.back()}>
              로그인하기
            </Button>
          </Layout.BottomArea>
        </>
      )}
      {completed && completed.socialType !== 'NONE' && (
        <>
          <Layout.Contents className='px-7'>
            <div className='mt-[200px] flex flex-col items-center gap-11 px-[63px]'>
              <SocialIcon socialType={completed.socialType} />
              <p
                className={cn(
                  Typography.TITLE_1_SEMIBOLD,
                  'mx-auto whitespace-pre-wrap break-keep text-center text-black'
                )}>
                <span className='text-primary'>{watch('email')}</span>은{'\n'}
                {socialProviders[completed.socialType].name} 계정으로 가입되어 있습니다.
              </p>
            </div>
          </Layout.Contents>
          <Layout.BottomArea>
            <Button
              variant='default'
              size='full'
              className={cn(Typography.TITLE_1_BOLD)}
              onClick={() => router.back()}>
              완료
            </Button>
          </Layout.BottomArea>
        </>
      )}
    </Layout>
  );
};

export { FindIdPage };
