'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useMyInfoQuery } from '@/feature/mypage';
import { IconArrowRightSmall, IconAvatar } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

export const TrainerMyPage = () => {
  const { data } = useMyInfoQuery();

  return (
    <Layout type='trainer'>
      <Layout.Header className='bg-white'></Layout.Header>
      <Layout.Contents>
        <Link href={'/trainer/mypage/info'}>
          <section className='flex items-center justify-between bg-white px-7 pb-7 pt-6'>
            <div className='flex'>
              {data?.profile ? (
                <Image
                  src={`${data.profile.fileUrl}?w=300&h=300&=q=90`}
                  alt='profile'
                  width={80}
                  height={80}
                  className='h-[80px] w-[80px] rounded-full border border-gray-300 object-cover'
                  priority
                />
              ) : (
                <IconAvatar width={80} height={80} />
              )}
              <div className='ml-5 flex flex-col justify-center'>
                <p className={cn(Typography.HEADING_3)}>{data?.name ?? ''}</p>
                <span className={cn(Typography.BODY_3, 'text-gray-500')}>
                  {data?.socialType === 'NONE' ? data.userId : data?.email}
                </span>
              </div>
            </div>
            <IconArrowRightSmall stroke={'var(--gray-400)'} />
          </section>
        </Link>
        <section className={'mt-3'}>
          <Link
            href={'/trainer/mypage/alarm'}
            className='flex justify-between bg-white px-7 py-[15px]'>
            <p className={cn(Typography.BODY_1)}>알림 설정</p>
            <IconArrowRightSmall stroke={'var(--gray-400)'} />
          </Link>
          <Link href={'/policy'} className='flex justify-between bg-white px-7 py-[15px]'>
            <p className={cn(Typography.BODY_1)}>약관 및 정책</p>
            <IconArrowRightSmall stroke={'var(--gray-400)'} />
          </Link>
          <Link href={'/cs'} className='flex justify-between bg-white px-7 py-[15px]'>
            <p className={cn(Typography.BODY_1)}>고객센터</p>
            <IconArrowRightSmall stroke={'var(--gray-400)'} />
          </Link>
        </section>

        <footer className='flex flex-col items-start gap-4 bg-transparent p-7'>
          <Link
            href={'#'}
            className={cn(Typography.BODY_2, 'border-b border-gray-300 text-gray-500')}>
            오픈 소스 라이선스 보기
          </Link>
        </footer>
      </Layout.Contents>
    </Layout>
  );
};
