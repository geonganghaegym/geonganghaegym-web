'use client';

import Image from 'next/image';
import Link from 'next/link';

import { getBaseRedirectUri } from '@/entity/auth';
import { useMyInfoQuery } from '@/feature/mypage';
import { useWeeklySchedules, WeeklyTimetable } from '@/feature/schedule';
import { IconCalendarX, IconGear, IconShare } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout, WeekPicker } from '@/widget';

export const TrainerSchedulePage = () => {
  const { data: userInfo } = useMyInfoQuery();
  const { successToast } = useToast();
  const {
    startDate,
    isCurrentWeek,
    isBeforeWeek,
    weeklySchedules,
    isPending,
    earliestLessonStartTime,
    latestLessonEndTime,
    changeWeek,
    createWeeklySchedules,
  } = useWeeklySchedules();

  const copyScheduleUrl = async () => {
    const trainerScheduleUrl = `${getBaseRedirectUri()}/schedule/${userInfo?.id}`;

    if (typeof navigator.share !== 'undefined') {
      await navigator.share({
        title: '건강해짐 - 트레이너 스케줄',
        text: `${userInfo?.gym.name} ${userInfo?.name}님 주간 스케줄 링크`,
        url: trainerScheduleUrl,
      });
      return;
    }

    // navigator.share 사용 불가능한 경우
    await navigator.clipboard.writeText(trainerScheduleUrl);
    successToast('주간 스케줄 공유 링크를 복사했어요.');
  };

  return (
    <Layout type='trainer' className='bg-white'>
      <Layout.Header className='py-6'>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD)}>내 스케줄</h1>
        <div className='flex gap-7'>
          {isCurrentWeek && (
            <button onClick={copyScheduleUrl}>
              <IconShare />
            </button>
          )}
          <Link href='/trainer/schedule/setting'>
            <IconGear />
          </Link>
        </div>
      </Layout.Header>
      <Layout.Contents className='mt-6 overflow-hidden'>
        <WeekPicker startDate={startDate} onWeekChange={changeWeek} />
        {isPending && (
          <div className='flex-center h-full w-full'>
            <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
          </div>
        )}
        {!isPending && weeklySchedules !== null && (
          <WeeklyTimetable
            startDate={startDate}
            schedules={weeklySchedules}
            earliestLessonStartTime={earliestLessonStartTime}
            latestLessonEndTime={latestLessonEndTime}
          />
        )}
        {!isPending && weeklySchedules === null && !isBeforeWeek && (
          <div className='flex-center h-full w-full flex-col space-y-6'>
            <Button size='lg' onClick={createWeeklySchedules}>
              일정 등록
            </Button>
            <p
              className={cn(
                Typography.BODY_2,
                'whitespace-pre-wrap break-keep text-center text-gray-400'
              )}>{`회원님들은 매주 일요일 자정 이후에\n해당 주 예약이 가능합니다.`}</p>
          </div>
        )}
        {!isPending && weeklySchedules === null && isBeforeWeek && (
          <div className='flex-center h-full w-full flex-col gap-1'>
            <IconCalendarX />
            <p
              className={cn(
                Typography.HEADING_5,
                'whitespace-pre-wrap break-keep text-center text-gray-400'
              )}>{`예약된 수업이 없습니다.`}</p>
          </div>
        )}
      </Layout.Contents>
    </Layout>
  );
};
