'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { IconNoSchedule } from '@/shared/assets';
import CancelCalendarIcon from '@/shared/assets/images/icon_cancel_calendar.svg';
import ReservationCalendarIcon from '@/shared/assets/images/icon_reservation_calendar.svg';
import WaitingIcon from '@/shared/assets/images/icon_waiting.svg';
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

import { useStudentCancelWaitingScheduleMutation } from '../api/mutations';
import { ScheduleData } from '../model/type';

const NoWaiting = () => {
  return (
    <li
      className={cn(
        Typography.TITLE_1_BOLD,
        'flex flex-col items-center justify-center py-28 text-gray-400'
      )}>
      <span className='mb-5 w-[35px]'>
        <IconNoSchedule />
      </span>
      대기중인 수업이 없습니다.
    </li>
  );
};

interface Props {
  data: ScheduleData | null;
}

export const StudentMyWaitingSchedule = ({ data }: Props) => {
  const { successToast, errorToast } = useToast();
  const queryClient = useQueryClient();

  const currentTime = new Date();
  const classDate = new Date(`${data?.lessonDt} ${data?.lessonStartTime}`);

  const [isWaitingInfoSheetOpen, setIsWaitingInfoSheetOpen] = useState(false);
  const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
  const [isPastDate, setIsPastDate] = useState(false);

  const [lessonStartTime, period] = convertTo12HourFormat(
    data?.lessonStartTime ?? '00:00:00'
  );
  const [lessonEndTime] = convertTo12HourFormat(data?.lessonEndTime ?? '00:00:00');

  const selectDate = dayjs(data?.lessonDt).format('MM.DD(dd)');
  const reservatioDate = dayjs(data?.lessonDt).format('MM월 DD일 dddd');

  const { mutate } = useStudentCancelWaitingScheduleMutation();

  const handleIsPastDate = () => {
    const isPast = dayjs(currentTime).isAfter(dayjs(classDate).subtract(1, 'day'));
    setIsPastDate(isPast);
  };

  const handleCancelWaiting = () => {
    setIsWaitingInfoSheetOpen(false);
    setIsCancelSheetOpen(true);
  };

  const handleCancelSchedule = (scheduleId: number) => {
    mutate(scheduleId, {
      onSuccess: ({ message }) => {
        setIsCancelSheetOpen(false);
        void queryClient.invalidateQueries({
          queryKey: ['StudentMyWaitingList'],
        });
        void queryClient.invalidateQueries({
          queryKey: ['scheduleList'],
        });
        successToast(message);
      },
      onError: (error) => {
        errorToast(error.response?.data.message ?? '에러가 발생했습니다');
      },
    });
  };

  useEffect(() => {
    handleIsPastDate();
  }, []);

  if (!data) {
    return <NoWaiting />;
  }

  return (
    data && (
      <li className='relative mb-5'>
        <Sheet open={isWaitingInfoSheetOpen} onOpenChange={setIsWaitingInfoSheetOpen}>
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
                    <WaitingIcon />
                  </span>
                </p>
                {!isPastDate && (
                  <Button
                    asChild
                    variant='ghost'
                    onClick={(event) => {
                      handleCancelWaiting();
                      event.stopPropagation(); // 이벤트 버블링 중지
                    }}>
                    <span
                      className={cn(
                        Typography.BODY_3,
                        'absolute right-6 top-[50%] h-11 w-[82px] -translate-y-1/2 transform rounded-md bg-gray-100 text-center text-gray-700'
                      )}>
                      대기취소
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent side='bottom' headerType='thumb'>
            <SheetHeader className='mb-8 text-left'>
              <h3 className={cn(Typography.HEADING_4_BOLD, 'mb-2 text-black')}>
                대기중인 예약 정보
              </h3>
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
                <dl className='mb-2 flex items-start justify-start'>
                  <dt className='mt-[3px] flex items-center justify-between'>
                    <ReservationCalendarIcon />
                  </dt>
                  <dd className={cn(Typography.BODY_1, 'ml-2 text-gray-600')}>
                    취소건 발생 시 자동으로 예약되며, 푸쉬 알림을 통해 알려드립니다.
                  </dd>
                </dl>
                <dl className='mb-2 flex items-start justify-start'>
                  <dt className='mt-[3px] flex items-center justify-between'>
                    <CancelCalendarIcon />
                  </dt>
                  <dd className={cn(Typography.BODY_1, 'ml-2 text-gray-600')}>
                    수업일 기준 24시간 전까지 취소건 발생하지 않을 시 자동 취소됩니다.
                  </dd>
                </dl>
              </div>
            </div>

            <SheetFooter className='flex flex-row items-center justify-center gap-3'>
              {isPastDate ? (
                <Button
                  className='h-12 w-full rounded-md'
                  onClick={() => setIsWaitingInfoSheetOpen(false)}>
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
                    onClick={handleCancelWaiting}>
                    대기취소
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
                대기를 취소할까요?
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
