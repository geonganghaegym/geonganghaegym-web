'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';

import { useMyInfoQuery } from '@/feature/mypage';
import {
  IconArrowRightSmall,
  IconAvatar,
  IconClassLog,
  IconDiet,
  IconExerciseLog,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

export const StudentMyPage = () => {
  const { data } = useMyInfoQuery();
  const today = new Date();
  const month = dayjs(today).format('YYYY-MM');

  return (
    <Layout type='student'>
      <Layout.Header className='bg-white' />
      <Layout.Contents>
        {data && (
          <Link href={'/student/mypage/info'}>
            <article className='flex items-center justify-between bg-white px-7 pb-7 pt-6'>
              <div className='flex'>
                {data?.profile ? (
                  <div className='h-[80px] w-[80px] overflow-hidden rounded-full'>
                    <Image
                      src={`${data?.profile.fileUrl}?w=300&h=300&q=90`}
                      width={80}
                      height={80}
                      alt='profile'
                      className='rounded-full border border-gray-300 object-cover'
                      priority
                    />
                  </div>
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
            </article>
          </Link>
        )}

        <div className='bg-white py-6 pb-9'>
          <article className='mypage-box-shadow m-auto flex w-[320px] items-center rounded-lg bg-white'>
            <Link href='/student/log' className='py-5 pl-8 pr-9'>
              <div className='flex flex-col items-center justify-center gap-y-5'>
                <IconClassLog />
                수업일지
              </div>
            </Link>
            <span className='h-11 w-[1px] border border-gray-200' />
            <Link href={`/student/diet?month=${month}`} className='px-11 py-5'>
              <div className='flex flex-col items-center justify-center gap-y-5'>
                <IconDiet />
                식단
              </div>
            </Link>
            <span className='h-11 w-[1px] border border-gray-200' />
            <Link href='/student/workout' className='py-5 pl-9 pr-8'>
              <div className='flex flex-col items-center justify-center gap-y-5'>
                <IconExerciseLog />
                운동기록
              </div>
            </Link>
          </article>
        </div>

        <ul>
          <li>
            <Link
              href={`/student/mypage/last-reservation?month=${month}`}
              className='flex items-center justify-between bg-white px-7 py-[15px]'>
              <p className={cn(Typography.BODY_1)}>지난 예약</p>
              <IconArrowRightSmall stroke={'var(--gray-400)'} />
            </Link>
          </li>
          <li>
            <Link
              href={'/student/mypage/trainer-info'}
              className='flex items-center justify-between bg-white px-7 py-[15px]'>
              <p className={cn(Typography.BODY_1)}>트레이너 정보</p>
              <IconArrowRightSmall stroke={'var(--gray-400)'} />
            </Link>
          </li>
          <li>
            <Link
              href={'/student/mypage/alarm'}
              className='flex items-center justify-between bg-white px-7 py-[15px]'>
              <p className={cn(Typography.BODY_1)}>알림 설정</p>
              <IconArrowRightSmall stroke={'var(--gray-400)'} />
            </Link>
          </li>
          <li>
            <Link
              href={'/policy'}
              className='flex items-center justify-between bg-white px-7 py-[15px]'>
              <p className={cn(Typography.BODY_1)}>약관 및 정책</p>
              <IconArrowRightSmall stroke={'var(--gray-400)'} />
            </Link>
          </li>
          <li>
            <Link
              href={'/cs'}
              className='flex items-center justify-between bg-white px-7 py-[15px]'>
              <p className={cn(Typography.BODY_1)}>고객센터</p>
              <IconArrowRightSmall stroke={'var(--gray-400)'} />
            </Link>
          </li>
        </ul>

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
