'use client';

import dayjs from 'dayjs';

import { Typography } from '@/shared/mixin';
import { cn, timeToDecimal } from '@/shared/utils';

import { useWeeklyTimetable } from '../../hook/useWeeklyTimetable';
import { TrainerSchedule } from '../../model/type';
import { DayOfWeekRow } from './DayOfWeekRow';
import { ScheduleItem } from './ScheduleItem';

const WeeklyTimetable = ({
  schedules,
  startDate,
  earliestLessonStartTime,
  latestLessonEndTime,
}: {
  schedules: [string, TrainerSchedule[]][];
  startDate: Date;
  earliestLessonStartTime?: string;
  latestLessonEndTime?: string;
}) => {
  const { flatSchedules } = useWeeklyTimetable({
    schedules,
    startDate,
    earliestLessonStartTime,
  });

  const startHour = earliestLessonStartTime ? timeToDecimal(earliestLessonStartTime) : 6;
  const endHour = latestLessonEndTime ? timeToDecimal(latestLessonEndTime) : 24;

  const hourAxis = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);

  const dayOfWeekAxis = Array.from({ length: 7 }, (_, i) =>
    dayjs(startDate).add(i, 'day').toDate()
  );

  return (
    <div className='mt-7 flex h-full w-screen max-w-(--max-width) flex-1 overflow-hidden'>
      <div className='hide-scrollbar relative ml-7 flex-1 overflow-auto'>
        <div className='mr-7 pb-[100px]'>
          <DayOfWeekRow startDate={startDate} flatSchedules={flatSchedules} />
          <div className='relative flex'>
            <div className='bg-wthie sticky left-0 z-10 w-[21px] text-center'>
              {hourAxis.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    Typography.BODY_4_MEDIUM,
                    'h-16 border border-t-0 border-gray-200 bg-white text-center text-gray-700'
                  )}>
                  {hour}
                </div>
              ))}
            </div>
            {dayOfWeekAxis.map((_, i) => (
              <div key={i} className='min-w-0 flex-1'>
                {hourAxis.map((_, j) => (
                  <div
                    key={j}
                    className='h-16 border-b border-r border-gray-200 bg-gray-100'></div>
                ))}
              </div>
            ))}
            <div className='absolute left-[21px] right-0 top-0 z-0 h-full'>
              {flatSchedules.map((schedule) => {
                return <ScheduleItem key={schedule.scheduleId} schedule={schedule} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { WeeklyTimetable };
