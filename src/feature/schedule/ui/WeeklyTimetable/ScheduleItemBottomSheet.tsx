import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
dayjs.locale('ko');

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  IconCalendarCancel,
  IconCalendarCancelProfile,
  IconCalendarCheck,
  IconCalendarCheckProfile,
  IconCameraNegative,
  IconCameraPositive,
  IconDocumentProfile,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, DialogClose, DialogContent, SheetContent, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';

import {
  useTrainerCancelReservationMutation,
  useTrainerChangeNoShowMutation,
  useTrainerChangeReservationMutation,
  useTrainerChangeShowMutation,
} from '../../api/mutations';
import { FlatSchedule } from '../../model/type';

const ScheduleItemBottomSheet = ({ schedule }: { schedule: FlatSchedule }) => {
  return sheetMapper(schedule)[schedule.reservationStatus];
};

const sheetMapper = (schedule: FlatSchedule) => ({
  COMPLETED: <CompletedSheet schedule={schedule} />,
  SOLD_OUT: <CompletedSheet schedule={schedule} />,
  AVAILABLE: <AvailableSheet schedule={schedule} />,
  NO_SHOW: <NoShowSheet schedule={schedule} />,
  DISABLED: <DisabledSheet schedule={schedule} />,
  LUNCH_TIME: <DisabledSheet schedule={schedule} />,
});

const CompletedSheet = ({ schedule }: { schedule: FlatSchedule }) => {
  const queryClient = useQueryClient();
  const { errorToast } = useToast();
  const { mutate: cancelReservation } = useTrainerCancelReservationMutation();
  const { mutate: changeNoShow } = useTrainerChangeNoShowMutation();
  const { date, applicantName, scheduleId, applicantId, lessonStartTime, lessonEndTime } =
    schedule;
  const title = `${dayjs(date).format('M.DD(ddd) A')} ${lessonStartTime} ~ ${lessonEndTime}`;
  const isBefore = dayjs(date + ' ' + lessonStartTime).isBefore(dayjs());

  const [confirm, setConfirm] = useState(false);

  const handleCancelReservation = () => {
    cancelReservation(scheduleId, {
      onSuccess: async () => {
        await queryClient.refetchQueries({
          queryKey: ['schedule'].filter(Boolean),
        });
      },
      onError: (error) => {
        const message = error?.response?.data.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  const handleChangeToNoShow = () => {
    if (!isBefore) return;
    changeNoShow(scheduleId, {
      onSuccess: async () => {
        await queryClient.refetchQueries({
          queryKey: ['schedule'].filter(Boolean),
        });
      },
      onError: (error) => {
        const message = error?.response?.data.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  useEffect(() => {
    setConfirm(false);
  }, [schedule]);

  if (confirm) {
    return (
      <DialogContent className='flex w-[calc(100%-40px)] max-w-[320px] flex-col rounded-md bg-white p-7 text-center'>
        <h3 className={cn(Typography.TITLE_1_SEMIBOLD)}>수업을 취소하시겠습니까?</h3>
        <div className='mt-8 flex gap-3'>
          <DialogClose className='w-full rounded-md bg-gray-100 py-[13px] text-gray-600'>
            아니요
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant='default'
              size={'full'}
              onClick={handleCancelReservation}
              className='rounded-md py-[13px]'>
              예
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    );
  }

  return (
    <SheetContent side='bottom' className='p-7 pb-11'>
      <div className='flex w-full flex-col'>
        <h3 className={cn(Typography.HEADING_3)}>{applicantName}</h3>
        <p className={cn(Typography.BODY_1, 'mt-2')}>{title}</p>
        <div className={cn('mt-7 flex w-full justify-center gap-6')}>
          {!isBefore && (
            <button
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
              )}
              onClick={() => setConfirm(true)}>
              <IconCalendarCancel />
              수업 취소하기
            </button>
          )}
          <Link
            href={`/trainer/manage/${applicantId}`}
            className={cn(
              Typography.TITLE_1_SEMIBOLD,
              'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
            )}>
            <IconDocumentProfile />
            회원 정보 보기
          </Link>
          {isBefore && (
            <DialogClose
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
              )}
              onClick={handleChangeToNoShow}>
              <IconCalendarCancelProfile />
              미출석 체크
            </DialogClose>
          )}
        </div>
      </div>
    </SheetContent>
  );
};

const AvailableSheet = ({ schedule }: { schedule: FlatSchedule }) => {
  const { errorToast } = useToast();
  const { mutate } = useTrainerChangeReservationMutation();

  const queryClient = useQueryClient();

  const { date, scheduleId, lessonStartTime, lessonEndTime } = schedule;

  const title = `${dayjs(date).format('M.DD(ddd) A')} ${lessonStartTime} ~ ${lessonEndTime}`;
  const isBefore = dayjs(date + ' ' + lessonStartTime).isBefore(dayjs());

  const cancelReservation = () => {
    mutate(
      { status: 'DISABLED', scheduleIds: [scheduleId] },
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

  if (isBefore) {
    return null;
  }

  return (
    <SheetContent side='bottom' className='p-7 pb-11'>
      <div className='flex w-full flex-col'>
        <h3 className={cn(Typography.HEADING_3)}>{title}</h3>
        <div className={cn('mt-7 flex w-full justify-center gap-6')}>
          <Link
            href={`/trainer/schedule/select?scheduleId=${scheduleId}`}
            className={cn(
              Typography.TITLE_1_SEMIBOLD,
              'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
            )}>
            <IconCameraPositive />
            수업 추가하기
          </Link>
          <DialogClose asChild>
            <button
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
              )}
              onClick={cancelReservation}>
              <IconCameraNegative />
              예약 불가로 변경
            </button>
          </DialogClose>
        </div>
      </div>
    </SheetContent>
  );
};

const NoShowSheet = ({ schedule }: { schedule: FlatSchedule }) => {
  const queryClient = useQueryClient();
  const { errorToast } = useToast();
  const { date, applicantId, scheduleId, applicantName, lessonStartTime, lessonEndTime } =
    schedule;
  const title = `${dayjs(date).format('M.DD(ddd) A')} ${lessonStartTime} ~ ${lessonEndTime}`;
  const { mutate } = useTrainerChangeShowMutation();

  const changeToShowStatus = () => {
    mutate(scheduleId, {
      onSuccess: async () => {
        await queryClient.refetchQueries({
          queryKey: ['schedule'].filter(Boolean),
        });
      },
      onError: (error) => {
        const message = error?.response?.data.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  return (
    <SheetContent side='bottom' className='p-7 pb-11'>
      <div className='flex w-full flex-col'>
        <h3 className={cn(Typography.HEADING_3)}>
          {applicantName}
          <span className='ml-4 text-point'>미출석</span>
        </h3>
        <p className={cn(Typography.BODY_1, 'mt-2')}>{title}</p>
        <div className={cn('mt-7 flex w-full justify-center gap-6')}>
          <Link
            href={`/trainer/manage/${applicantId}`}
            className={cn(
              Typography.TITLE_1_SEMIBOLD,
              'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
            )}>
            <IconDocumentProfile />
            회원 정보 보기
          </Link>
          <DialogClose asChild>
            <button
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
              )}
              onClick={changeToShowStatus}>
              <IconCalendarCheckProfile />
              출석 체크
            </button>
          </DialogClose>
        </div>
      </div>
      <div></div>
    </SheetContent>
  );
};

const DisabledSheet = ({ schedule }: { schedule: FlatSchedule }) => {
  const { errorToast } = useToast();
  const { mutate } = useTrainerChangeReservationMutation();
  const queryClient = useQueryClient();

  const { date, scheduleId, lessonStartTime, lessonEndTime } = schedule;
  const title = `${dayjs(date).format('M.DD(ddd) A')} ${lessonStartTime} ~ ${lessonEndTime}`;

  const isBefore = dayjs(date + ' ' + lessonStartTime).isBefore(dayjs());

  const enabledSchedule = () => {
    mutate(
      {
        status: 'AVAILABLE',
        scheduleIds: [scheduleId],
      },
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

  if (isBefore) {
    return null;
  }

  return (
    <SheetContent side='bottom' className='p-7 pb-11'>
      <div className='flex w-full flex-col'>
        <h3 className={cn(Typography.HEADING_3)}>{title}</h3>
        <p className={cn(Typography.BODY_1, 'mt-2 text-point')}>예약 불가</p>
        <div className={cn('mt-7 flex w-full justify-center gap-6')}>
          <DialogClose
            className={cn(
              Typography.TITLE_1_SEMIBOLD,
              'flex h-[120px] w-[120px] flex-col items-center justify-center gap-5 rounded-lg border border-gray-200'
            )}
            onClick={enabledSchedule}>
            <IconCalendarCheck />
            수업 운영하기
          </DialogClose>
        </div>
      </div>
    </SheetContent>
  );
};

export { ScheduleItemBottomSheet };
