'use client';

import 'dayjs/locale/ko';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';

import CancelCalendarIcon from '@/shared/assets/images/icon_cancel_calendar.svg';
import ReservationCalendarIcon from '@/shared/assets/images/icon_reservation_calendar.svg';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  useToast,
} from '@/shared/ui';
import { cn, convertTo12HourFormat } from '@/shared/utils';

import { useStudentReservationScheduleMutation } from '../api/mutations';
import { AllScheduleData } from '../model/type';

dayjs.locale('ko');

interface Props {
  data: AllScheduleData;
  date: Date;
}

export const ReservationBottomSheet = ({ data, date }: Props) => {
  const { successToast, errorToast } = useToast();

  const classDate = new Date(`${data?.lessonDt} ${data?.lessonStartTime}`);

  const queryClient = useQueryClient();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [lessonStartTime, period] = convertTo12HourFormat(
    data?.lessonStartTime ?? '00:00:00'
  );
  const [lessonEndTime] = convertTo12HourFormat(data?.lessonEndTime ?? '00:00:00');
  const [reservationTime, reservationPeriod] = convertTo12HourFormat(
    dayjs(classDate).subtract(30, 'minute').format('HH:mm') ?? '00:00:00'
  );

  const selectDate = dayjs(date).format('MM.DD(dd)');
  const previousDate = dayjs(date).subtract(1, 'day').format('MM.DD(dd)');

  const { mutate } = useStudentReservationScheduleMutation();

  const handleReservationSchedule = (scheduleId: number) => {
    mutate(scheduleId, {
      onSuccess: ({ message }) => {
        setIsSheetOpen(false);
        void queryClient.invalidateQueries({
          queryKey: ['scheduleList'],
        });
        void queryClient.invalidateQueries({
          queryKey: ['StudentCalendarMyReservationList'],
        });
        void queryClient.invalidateQueries({
          queryKey: ['StudentMyReservationList'],
        });
        successToast(message);
      },
      onError: (error) => {
        errorToast(error.response?.data.message);
      },
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' className='h-full w-full flex-col bg-white py-[15px] '>
          <span>{lessonStartTime}</span>
          <span className={cn(Typography.TITLE_3, 'block text-blue-400')}>예약하기</span>
        </Button>
      </SheetTrigger>
      <SheetContent headerType='thumb'>
        <SheetHeader className='mb-8 text-left'>
          <h2 className={cn(Typography.HEADING_4_BOLD, 'mb-2 text-black')}>
            이 수업을 예약할까요?
          </h2>
          <p className={cn(Typography.TITLE_2, 'text-gray-600')}>
            무단결석이나 24시간 내 예약을 취소하지 못한 경우 수강권에서 잔여 횟수가 자동
            차감됩니다.
          </p>
        </SheetHeader>
        <div>
          <div
            className={cn(
              'mb-7 rounded-md bg-gray-100 p-6 text-center text-black',
              Typography.HEADING_3
            )}>
            {selectDate} {period} {lessonStartTime} - {lessonEndTime}
          </div>

          <div className='mb-11'>
            <dl className='mb-2 flex items-center justify-between'>
              <dt className='flex items-center justify-between'>
                <ReservationCalendarIcon />
                <span className={cn('ml-2 text-gray-600', Typography.TITLE_1_SEMIBOLD)}>
                  예약
                </span>
              </dt>
              <dd className={cn(Typography.BODY_1, 'text-gray-600')}>
                {`${selectDate} ${reservationPeriod} ${reservationTime} 까지`}
              </dd>
            </dl>
            <dl className='mb-2 flex items-center justify-between'>
              <dt className='flex items-center justify-between'>
                <CancelCalendarIcon />
                <span className={cn('ml-2 text-gray-600', Typography.TITLE_1_SEMIBOLD)}>
                  취소
                </span>
              </dt>
              <dd className={cn(Typography.BODY_1, 'text-gray-600')}>
                {`${previousDate} ${period} ${lessonStartTime} 까지`}
              </dd>
            </dl>
          </div>
        </div>
        <SheetFooter className='flex flex-row items-center justify-center gap-3'>
          <SheetClose
            className={cn(
              'h-12 w-full rounded-md bg-gray-100 text-gray-600',
              Typography.TITLE_1_SEMIBOLD
            )}>
            아니요
          </SheetClose>
          <Button
            className={cn('h-12 w-full rounded-md', Typography.TITLE_1_SEMIBOLD)}
            onClick={() => handleReservationSchedule(data.scheduleId)}>
            예약하기
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
