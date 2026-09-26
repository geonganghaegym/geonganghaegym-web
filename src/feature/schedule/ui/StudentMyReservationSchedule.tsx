'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { IconCheck, IconNoSchedule } from '@/shared/assets';
import CancelCalendarIcon from '@/shared/assets/images/icon_cancel_calendar.svg';
import ReservationCalendarIcon from '@/shared/assets/images/icon_reservation_calendar.svg';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  useToast,
} from '@/shared/ui';
import { cn, convertTo12HourFormat } from '@/shared/utils';

import { useStudentCancelReservationScheduleMutation } from '../api/mutations';
import { ScheduleData } from '../model/type';

const NoReservation = () => {
  return (
    <li
      className={cn(
        Typography.TITLE_1_BOLD,
        'flex flex-col items-center justify-center py-28 text-gray-400'
      )}>
      <span className='mb-5 w-[35px]'>
        <IconNoSchedule />
      </span>
      예약된 수업이 없습니다.
    </li>
  );
};

interface Props {
  data: ScheduleData | null;
}

export const StudentMyReservationSchedule = ({ data }: Props) => {
  const queryClient = useQueryClient();
  const { successToast, errorToast } = useToast();

  const currentTime = new Date();
  const classDate = new Date(`${data?.lessonDt} ${data?.lessonStartTime}`);

  const [isReservationInfoSheetOpen, setIsReservationInfoSheetOpen] = useState(false);
  const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
  const [isPastDate, setIsPastDate] = useState(false);

  const [lessonStartTime, period] = convertTo12HourFormat(
    data?.lessonStartTime ?? '00:00:00'
  );
  const [lessonEndTime] = convertTo12HourFormat(data?.lessonEndTime ?? '00:00:00');
  const [reservationTime, reservationPeriod] = convertTo12HourFormat(
    dayjs(classDate).subtract(30, 'minute').format('HH:mm') ?? '00:00:00'
  );
  const selectDate = dayjs(data?.lessonDt).format('MM.DD(dd)');
  const previousDate = dayjs(data?.lessonDt).subtract(1, 'day').format('MM.DD(dd)');
  const reservatioDate = dayjs(data?.lessonDt).format('MM월 DD일 dddd');

  const { mutate } = useStudentCancelReservationScheduleMutation();

  const handleIsPastDate = () => {
    const isPast = dayjs(currentTime).isAfter(dayjs(classDate).subtract(1, 'day'));
    setIsPastDate(isPast);
  };

  const handleCancelReservation = () => {
    setIsReservationInfoSheetOpen(false);
    setIsCancelSheetOpen(true);
  };

  const handleCancelSchedule = (scheduleId: number) => {
    mutate(scheduleId, {
      onSuccess: ({ message }) => {
        setIsCancelSheetOpen(false);
        void queryClient.invalidateQueries({
          queryKey: ['StudentMyReservationList'],
        });
        void queryClient.invalidateQueries({
          queryKey: ['scheduleList'],
        });
        void queryClient.invalidateQueries({
          queryKey: ['StudentCalendarMyReservationList'],
        });
        successToast(message);
      },
      onError: (error) => {
        errorToast(error.response?.data.message);
      },
    });
  };

  useEffect(() => {
    handleIsPastDate();
  }, []);

  if (!data) {
    return <NoReservation />;
  }

  return (
    data && (
      <li className='relative mb-5'>
        <Sheet
          open={isReservationInfoSheetOpen}
          onOpenChange={setIsReservationInfoSheetOpen}>
          <SheetTrigger className='h-full w-full' onClick={handleIsPastDate}>
            <Card className='w-full px-6 py-7 text-left'>
              <CardHeader className={cn(Typography.TITLE_3, 'text-gray-600')}>
                {reservatioDate}
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    Typography.TITLE_1_BOLD,
                    'flex items-center justify-start text-black'
                  )}>
                  {period} {lessonStartTime} - {lessonEndTime}
                  <span className='ml-1'>
                    <IconCheck fill={'var(--primary-500)'} width={17} height={17} />
                  </span>
                </p>
                {!isPastDate && (
                  <Button
                    asChild
                    variant='ghost'
                    onClick={(event) => {
                      handleCancelReservation();
                      event.stopPropagation(); // 이벤트 버블링 중지
                    }}>
                    <span
                      className={cn(
                        Typography.BODY_3,
                        'absolute right-6 top-[50%] h-11 w-[82px] -translate-y-1/2 transform rounded-md bg-gray-100 text-center text-gray-700'
                      )}>
                      예약 취소
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent headerType='thumb'>
            <SheetHeader className='mb-8 text-left'>
              <h3 className={cn(Typography.HEADING_4_BOLD, 'mb-2 text-black')}>
                예약 정보
              </h3>
              <p className={cn(Typography.TITLE_2, 'text-gray-600')}>
                무단결석이나 24시간 내 예약을 취소하지 못한 경우 수강권에서 잔여 횟수가
                자동 차감됩니다.
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
                    <span
                      className={cn('ml-2 text-gray-600', Typography.TITLE_1_SEMIBOLD)}>
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
                    <span
                      className={cn('ml-2 text-gray-600', Typography.TITLE_1_SEMIBOLD)}>
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
              {isPastDate ? (
                <Button
                  className='h-12 w-full rounded-md'
                  onClick={() => setIsReservationInfoSheetOpen(false)}>
                  확인
                </Button>
              ) : (
                <>
                  <SheetClose
                    className={cn(
                      'h-12 w-full rounded-md bg-gray-100 text-gray-600',
                      Typography.TITLE_1_SEMIBOLD
                    )}>
                    확인
                  </SheetClose>
                  <Button
                    className={cn(
                      'h-12 w-full rounded-md bg-point',
                      Typography.TITLE_1_SEMIBOLD
                    )}
                    onClick={handleCancelReservation}>
                    예약 취소
                  </Button>
                </>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Sheet open={isCancelSheetOpen} onOpenChange={setIsCancelSheetOpen}>
          <SheetContent side='bottom' headerType='thumb'>
            <SheetHeader className='mb-8 text-left'>
              <h3 className={cn(Typography.HEADING_4_BOLD, 'mb-2 text-black')}>
                예약을 취소할까요?
              </h3>
            </SheetHeader>

            <div
              className={cn(
                'mb-11 rounded-md bg-gray-100 p-6 text-center text-black',
                Typography.HEADING_3
              )}>
              {selectDate} {period} {lessonStartTime} - {lessonEndTime}
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
                className={cn(
                  'h-12 w-full rounded-md bg-point',
                  Typography.TITLE_1_SEMIBOLD
                )}
                onClick={() => handleCancelSchedule(data?.scheduleId)}>
                취소하기
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </li>
    )
  );
};
