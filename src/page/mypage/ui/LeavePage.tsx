'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

import { useAuthAction, useDeleteAccountMutation } from '@/entity/auth';
import { IconBack } from '@/shared/assets';
import NoCircleCheckIcon from '@/shared/assets/images/noCircleCheck.svg';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const LeavePage = () => {
  const router = useRouter();
  const [agreement, setAgreement] = useState(false);
  const { mutate } = useDeleteAccountMutation();
  const { errorToast } = useToast();
  const { deleteUserInfo } = useAuthAction();

  const changeAgreement = (e: ChangeEvent<HTMLInputElement>) => {
    setAgreement(e.target.checked);
  };

  const deleteAccount = () => {
    mutate(undefined, {
      onSuccess: () => {
        deleteUserInfo();
        router.replace('/');
      },
      onError: (error) => {
        const message = error.response?.data?.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  return (
    <Layout className='bg-white'>
      <Layout.Header>
        <button onClick={() => router.back()}>
          <IconBack />
        </button>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD)}>회원 탈퇴</h1>
        <div className='w-[40px] cursor-default bg-transparent' tabIndex={-1}></div>
      </Layout.Header>
      <Layout.Contents className='flex flex-col gap-[72px] px-7 py-8'>
        <section className='flex flex-col gap-11'>
          <div>
            <h3 className={cn(Typography.TITLE_3)}>회원탈퇴 유의사항</h3>
            <ul className={cn(Typography.BODY_3, 'mt-3 text-gray-700')}>
              <li className='mt-2'>• 탈퇴 후에는 위 계정으로 로그인하실 수 없습니다.</li>
              <li className='mt-2'>
                • 보유한 포인트 및 이용 기록, 수강권 등은 탈퇴 시 소멸되며 복구가
                불가능합니다.
              </li>
              <li className='mt-2'>
                • 회원 탈퇴 후 재가입하더라도 탈퇴 전의 회원 정보, 운동 기록, 예약 내역,
                수강권 등은 복구되지 않습니다.
              </li>
            </ul>
          </div>
        </section>
        <section className='space-y-8'>
          <label className='flex gap-3'>
            <input
              id='checkbox'
              type='checkbox'
              className='peer hidden'
              checked={agreement}
              onChange={changeAgreement}
            />
            <span className='flex h-7 w-7 items-center justify-center rounded-sm border border-solid border-gray-300 peer-checked:border-none peer-checked:bg-primary-500'>
              <NoCircleCheckIcon width={15} height={12} fill='white' />
            </span>
            <p className={cn(Typography.BODY_2)}>
              위 내용을 모두 확인하였으며, 회원 탈퇴합니다.
            </p>
          </label>
          <Dialog>
            <DialogTrigger
              disabled={!agreement}
              className='diabled:text-gray-400 w-full rounded-md border border-point py-5 text-point disabled:border-gray-300 disabled:text-gray-400'>
              계정 삭제하기
            </DialogTrigger>
            <DialogContent className='flex w-[320px] flex-col rounded-md bg-white p-7'>
              <h3 className={cn(Typography.TITLE_1_BOLD)}>정말로 탈퇴하시겠어요?</h3>
              <p className={cn(Typography.BODY_2, 'mt-4')}>
                건강해짐 계정을 삭제하면 회원님의 수강권, 운동 기록, 식단 등 모든 정보가
                함께 사라지게 됩니다.
              </p>
              <div className='mt-8 flex gap-3'>
                <DialogClose className='w-full rounded-md bg-gray-100 py-[13px] text-gray-600'>
                  취소
                </DialogClose>
                <Button
                  variant='destructive'
                  size={'full'}
                  onClick={deleteAccount}
                  className='py-[13px]'>
                  탈퇴하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>
      </Layout.Contents>
    </Layout>
  );
};

export { LeavePage };
