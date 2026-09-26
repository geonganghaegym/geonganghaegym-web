'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { SocialSignIn, useInvitationInfoQuery } from '@/feature/auth';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const InvitedPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams?.get('uuid') ?? '';

  const { data, isPending, error } = useInvitationInfoQuery(uuid);

  // 렌더 중에 alert·이동을 하면 리렌더마다 반복된다 — 에러가 생겼을 때 한 번만 처리한다.
  useEffect(() => {
    if (error === null) return;
    alert(error?.response?.data.message);
    window.location.href = '/?type=student';
  }, [error]);

  return (
    !isPending &&
    data && (
      <Layout>
        <Layout.Contents className='flex flex-col items-center px-7'>
          <h1
            className={cn(
              Typography.HEADING_2,
              'mt-[30px] whitespace-pre-wrap break-keep text-center'
            )}>
            {`${data.trainer.name} 트레이너가\n${data.name}님을 초대했습니다!`}
          </h1>
          <div className='flex w-full items-center justify-center py-11'>
            <Image
              src='/images/letter_blue-heart.png'
              width={150}
              height={150}
              alt='letter blue heart'
              className='px-auto'
            />
          </div>
          <SocialSignIn memberType={'student'} uuid={uuid} />
          <Button
            className={cn(
              Typography.TITLE_3,
              'h-fit bg-transparent p-0 pt-7 text-gray-500'
            )}
            onClick={() => {
              router.push(`/sign-up?type=student&uuid=${uuid}`);
            }}>
            일반 계정 회원가입
          </Button>
          <p className='w-2/3 break-keep pt-10 text-center text-[11px] text-gray-400'>
            로그인 시{' '}
            <Link href='#' className='underline'>
              개인정보 처리방침
            </Link>{' '}
            및{' '}
            <Link href='#' className='underline'>
              서비스 이용약관에
            </Link>{' '}
            동의함으로 간주합니다.
          </p>
        </Layout.Contents>
      </Layout>
    )
  );
};
export { InvitedPage };
