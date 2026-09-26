'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HTMLAttributes } from 'react';

import { useCheckTrainerMemberMappingQuery } from '@/feature/schedule';
import {
  IconCalendarFilled,
  IconCalendarOutlined,
  IconCommunityFilled,
  IconCommunityOutlined,
  IconHomeFilled,
  IconHomeOutlined,
  IconProfileFilled,
  IconProfileOutlined,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';

const TrainerNavigation = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const pathname = usePathname();
  return (
    <nav
      className={cn('rounded-tl-md rounded-tr-md bg-white shadow-nav', className)}
      {...props}>
      <ul className='flex items-center justify-between px-11 py-[18px]'>
        <li>
          <Link
            href='/trainer'
            className='flex flex-col items-center justify-between gap-y-2'>
            {pathname === '/trainer' || pathname === '/trainer/manage' ? (
              <IconHomeFilled />
            ) : (
              <IconHomeOutlined />
            )}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/trainer' ? 'text-black' : 'text-gray-700'
              )}>
              홈
            </span>
          </Link>
        </li>
        <li>
          <Link
            href='/trainer/schedule'
            className='flex flex-col items-center justify-between gap-y-2'>
            {pathname === '/trainer/schedule' ? (
              <IconCalendarFilled />
            ) : (
              <IconCalendarOutlined />
            )}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/trainer/schedule' ? 'text-black' : 'text-gray-700'
              )}>
              스케줄
            </span>
          </Link>
        </li>
        <li>
          <Link
            href='/trainer/community'
            className='flex flex-col items-center justify-between gap-y-2'>
            {pathname === '/trainer/community' ? (
              <IconCommunityFilled />
            ) : (
              <IconCommunityOutlined />
            )}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/trainer/community' ? 'text-black' : 'text-gray-700'
              )}>
              커뮤니티
            </span>
          </Link>
        </li>
        <li>
          <Link
            href='/trainer/mypage'
            className='flex flex-col items-center justify-between gap-y-2'>
            {pathname === '/trainer/mypage' ? (
              <IconProfileFilled />
            ) : (
              <IconProfileOutlined />
            )}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/trainer/mypage' ? 'text-black' : 'text-gray-700'
              )}>
              마이
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

const StudentNavigation = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const pathname = usePathname();
  const router = useRouter();

  const { errorToast } = useToast();
  const { refetch } = useCheckTrainerMemberMappingQuery();

  const clickCheckMappedTrainer = async () => {
    try {
      const newData = await refetch();
      if (newData.data?.mapped) {
        router.replace('/student/schedule');
      } else {
        errorToast('트레이너가 지정된 후에 예약 가능합니다');
      }
    } catch {
      errorToast('트레이너가 지정된 후에 예약 가능합니다');
    }
  };

  return (
    <nav
      className={cn('rounded-tl-md rounded-tr-md bg-white shadow-nav', className)}
      {...props}>
      <ul className='flex items-center justify-between px-11 py-[18px]'>
        <li>
          <Link
            href='/student'
            className='flex flex-col items-center justify-between gap-y-2'>
            {pathname === '/student' ? <IconHomeFilled /> : <IconHomeOutlined />}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/student' ? 'text-black' : 'text-gray-700'
              )}>
              홈
            </span>
          </Link>
        </li>
        <li>
          <Button
            variant='ghost'
            size='auto'
            onClick={clickCheckMappedTrainer}
            className='flex flex-col items-center justify-between gap-y-2 p-0 leading-[15px]'>
            {pathname === '/student/schedule' ? (
              <IconCalendarFilled />
            ) : (
              <IconCalendarOutlined />
            )}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/student/schedule' ? 'text-black' : 'text-gray-700'
              )}>
              수업예약
            </span>
          </Button>
        </li>
        <li>
          <Link
            href='/student/community'
            className='flex flex-col items-center justify-between gap-y-2'>
            {pathname === '/student/community' ? (
              <IconCommunityFilled />
            ) : (
              <IconCommunityOutlined />
            )}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/student/community' ? 'text-black' : 'text-gray-700'
              )}>
              커뮤니티
            </span>
          </Link>
        </li>
        <li>
          <Link
            href='/student/mypage'
            className='flex flex-col items-center justify-between gap-y-2'>
            {pathname === '/student/mypage' ? (
              <IconProfileFilled />
            ) : (
              <IconProfileOutlined />
            )}
            <span
              className={cn(
                Typography.NAV_TEXT,
                pathname === '/student/mypage' ? 'text-black' : 'text-gray-700'
              )}>
              마이
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export { StudentNavigation, TrainerNavigation };
