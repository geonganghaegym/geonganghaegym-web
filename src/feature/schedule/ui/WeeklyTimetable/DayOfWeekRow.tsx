import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';

import { IconCalendarCheck, IconCalendarRefresh } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Sheet,
  SheetContent,
  SheetTrigger,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';

import { useTrainerChangeReservationMutation } from '../../api/mutations';
import { FlatSchedule } from '../../model/type';

interface Props {
  startDate: Date;
  flatSchedules: FlatSchedule[];
}

const DayOfWeekRow = ({ startDate, flatSchedules }: Props) => {
  const queryClient = useQueryClient();
  const { errorToast } = useToast();
  const { mutate } = useTrainerChangeReservationMutation();

  const [confirm, setConfirm] = useState<Date | null>(null);

  const turnCloseDay = (day: Date) => {
    const hasSchedule = flatSchedules.some(
      (item) =>
        item.date === dayjs(day).format('YYYY-MM-DD') &&
        (item.reservationStatus === 'COMPLETED' || item.reservationStatus === 'SOLD_OUT')
    );

    if (hasSchedule) {
      setConfirm(day);
      return;
    }

    handleChangeClosedDay(day);
  };

  const turnOpenDay = (day: Date) => {
    const scheduleIds = flatSchedules
      .filter((item) => item.date === dayjs(day).format('YYYY-MM-DD'))
      .map((item) => item.scheduleId);

    mutate(
      { status: 'AVAILABLE', scheduleIds },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({
            queryKey: ['schedule'].filter(Boolean),
          });
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  const handleChangeClosedDay = (targetDate: Date | null) => {
    if (!targetDate) {
      return;
    }

    const scheduleIds = flatSchedules
      .filter(
        (item) =>
          item.date === dayjs(targetDate).format('YYYY-MM-DD') &&
          item.reservationStatus !== 'DISABLED'
      )
      .map((item) => item.scheduleId);

    if (scheduleIds.length === 0) {
      return;
    }

    mutate(
      { status: 'DISABLED', scheduleIds },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({
            queryKey: ['schedule'].filter(Boolean),
          });
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  const dayOfWeekAxis = Array.from({ length: 7 }, (_, i) =>
    dayjs(startDate).add(i, 'day').toDate()
  );

  return (
    <div className='sticky top-0 z-20 flex bg-white'>
      <div className='sticky left-0 z-30 w-[21px] border border-gray-200 bg-white' />
      {dayOfWeekAxis.map((day) => {
        const dayOfWeek = dayjs(day).format('ddd');
        const isToday = dayjs().isSame(day, 'day');
        const isBefore = dayjs(day.toDateString()).isBefore(dayjs(), 'day');
        const isClosedDay = flatSchedules
          .filter((item) => item.date === dayjs(day).format('YYYY-MM-DD'))
          .every((item) => item.reservationStatus === 'DISABLED');
        return (
          <Sheet key={dayOfWeek}>
            <SheetTrigger
              className={cn(
                Typography.BODY_4_MEDIUM,
                'flex-center h-12 min-w-0 flex-1 flex-col border border-l-0 border-gray-200 text-gray-700'
              )}
              tabIndex={-1}>
              {dayOfWeek}
              <p
                className={cn(
                  Typography.TITLE_3,
                  'flex-center size-[26px] rounded-full text-gray-700',
                  isToday && 'bg-primary-500 text-white'
                )}>
                {dayjs(day).format('D')}
              </p>
            </SheetTrigger>
            {!isBefore && !isClosedDay && (
              <SheetContent side='bottom' className='p-7 pb-11'>
                <div className='flex w-full flex-col'>
                  <h3 className={cn(Typography.HEADING_3)}>
                    {dayjs(day).format('M.DD(ddd)')}
                  </h3>
                  <div className={cn('mt-7 flex w-full justify-center gap-6')}>
                    <DialogClose
                      className={cn(
                        Typography.TITLE_1_SEMIBOLD,
                        'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
                      )}
                      onClick={() => {
                        turnCloseDay(day);
                      }}>
                      <IconCalendarRefresh />
                      휴무일로 변경
                    </DialogClose>
                  </div>
                </div>
              </SheetContent>
            )}
            {!isBefore && isClosedDay && (
              <SheetContent side='bottom' className='p-7 pb-11'>
                <div className='flex w-full flex-col'>
                  <h3 className={cn(Typography.HEADING_3)}>
                    {dayjs(day).format('M.DD(ddd)')}
                    {` `}
                    <span className={cn(Typography.HEADING_3, 'text-point')}>휴무</span>
                  </h3>
                  <div className={cn('mt-7 flex w-full justify-center gap-6')}>
                    <DialogClose
                      className={cn(
                        Typography.TITLE_1_SEMIBOLD,
                        'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
                      )}
                      onClick={() => {
                        turnOpenDay(day);
                      }}>
                      <IconCalendarCheck />
                      수업 운영하기
                    </DialogClose>
                  </div>
                </div>
              </SheetContent>
            )}
          </Sheet>
        );
      })}
      <Dialog open={confirm !== null}>
        <DialogContent className='w-[calc(100%-40px)] max-w-[320px] rounded-md p-7'>
          <h3
            className={cn(
              Typography.TITLE_1_BOLD
            )}>{`${dayjs(confirm).format('M.DD(ddd)')} 예약된 수업이 있습니다.\n휴무일로 변경하시겠습니까?`}</h3>
          <p className={cn(Typography.BODY_2, 'mt-4')}>
            해당 날짜에 예약된 수업은 취소됩니다.
          </p>
          <div className='mt-8 flex gap-3'>
            <DialogClose
              className='w-full rounded-md bg-gray-100 py-[13px] text-gray-600'
              onClick={() => setConfirm(null)}>
              아니요
            </DialogClose>
            <Button
              variant='destructive'
              size={'full'}
              className='py-[13px]'
              onClick={() => {
                handleChangeClosedDay(confirm);
                setConfirm(null);
              }}>
              예
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { DayOfWeekRow };
