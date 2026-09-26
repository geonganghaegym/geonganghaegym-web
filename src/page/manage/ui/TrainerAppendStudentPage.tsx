'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

import { useAppendMemberMutation } from '@/feature/manage';
import CloseIcon from '@/shared/assets/images/icon_close.svg';
import { Typography } from '@/shared/mixin';
import { Button, Input } from '@/shared/ui';
import { useToast } from '@/shared/ui/toast/use-toast';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

export const TrainerAppendStudentPage = ({ memberId }: { memberId: number }) => {
  const router = useRouter();
  const { successToast, errorToast } = useToast();
  const searchParams = useSearchParams();
  const name = searchParams?.get('name');
  if (!name || !memberId) {
    throw new Error();
  }

  const [lessonCnt, setLessonCnt] = useState(0);

  const queryClient = useQueryClient();
  const { mutate } = useAppendMemberMutation();

  const handleLessonCnt = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').replace(/^0+(?!$)/, '') || '0';

    const count = Number(value);

    setLessonCnt(count);

    if (count > 500) {
      errorToast('수강권 횟수는 최대 500회까지 입력할 수 있습니다.');
      setLessonCnt(500);
    }
  };

  const submit = () => {
    mutate(
      { name, lessonCnt, memberId },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({ queryKey: ['notRegisteredStudents'] });
          successToast('회원이 추가되었습니다.');
          router.replace('/trainer/manage/append');
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  const buttonDisabled = !lessonCnt;

  return (
    <Layout className='bg-white'>
      <Layout.Header>
        <div className='w-[40px] cursor-default bg-transparent' tabIndex={-1}></div>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD)}>회원 추가</h1>
        <Button
          variant='outline'
          className='border-none bg-transparent p-0 hover:bg-transparent'
          asChild>
          <Link href={'/trainer/manage/append'}>
            <CloseIcon width={20} height={20} />
          </Link>
        </Button>
      </Layout.Header>
      <Layout.Contents className='px-7 py-12'>
        <h2
          className={cn(
            Typography.HEADING_3,
            'whitespace-pre-wrap break-keep'
          )}>{`${name}님의 수강 정보를\n알려주세요.`}</h2>
        <div
          id='append-member-form'
          className={cn(Typography.TITLE_3, 'mt-[42px] flex justify-center gap-x-3')}>
          <div className='flex flex-col gap-y-3'>
            <p>이름</p>
            <div
              className={cn(
                'flex rounded-md border border-gray-200 bg-white px-6 py-[11.5px]'
              )}>
              <Input
                value={name}
                readOnly
                className={cn(Typography.TITLE_1_SEMIBOLD, 'read-only:text- w-full')}
              />
            </div>
          </div>
          <div className='flex flex-col gap-y-3'>
            <p>수업할 PT 횟수</p>
            <div
              className={cn(
                'flex gap-x-4 rounded-md border border-gray-200 bg-white px-6 py-[11.5px] focus-within:border-primary-500'
              )}>
              <Input
                type='text'
                pattern='[0-9]*'
                inputMode='numeric'
                className={cn(Typography.TITLE_1_SEMIBOLD, 'w-full')}
                value={lessonCnt}
                onChange={handleLessonCnt}
              />
              <div className={cn(Typography.BODY_1, 'right-6 text-gray-500')}>회</div>
            </div>
          </div>
        </div>
      </Layout.Contents>
      <Layout.BottomArea>
        <Button
          variant='default'
          size='full'
          onClick={submit}
          disabled={buttonDisabled}
          className={cn(Typography.TITLE_1_BOLD)}>
          추가하기
        </Button>
      </Layout.BottomArea>
    </Layout>
  );
};
