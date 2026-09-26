'use client';
/* eslint-disable react/prop-types */
import 'react-day-picker/dist/style.css';
import './react-calendar.css';

import { format } from 'date-fns';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DayButton, DayButtonProps, Formatters } from 'react-day-picker';

import {
  RegisterAndEditDiet,
  useDietShowNoticeMutation,
  useRegisterDietMutation,
  useStudentCalendarMyDietListQuery,
} from '@/entity/diet';
import {
  DailyDiet,
  defaultRequestData,
  DietContext,
  DietImageData,
  useDiet,
  useDietContext,
} from '@/feature/log-diet';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBack,
  IconClose,
  IconNotification,
} from '@/shared/assets';
import DownIcon from '@/shared/assets/images/icon_arrow_bottom.svg';
import { Typography } from '@/shared/mixin';
import { Button, Calendar, Card, CardContent, CardHeader, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

export const DietRegisterProvider = () => {
  const dietContextValue = useDiet();

  return (
    <DietContext.Provider value={dietContextValue}>
      <StudentDietRegisterPage />
    </DietContext.Provider>
  );
};

export const StudentDietRegisterPage = () => {
  const { successToast, errorToast } = useToast();

  const today = new Date();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { images, initialImages } = useDietContext();

  const [hasMounted, setHasMounted] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [isArrowToggle, setIsArrowToggle] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [currentWeek, setCurrentWeek] = useState({
    start: dayjs(date).startOf('week').toDate(),
    end: dayjs(date).endOf('week').toDate(),
  });

  const { mutate: noticeMutate } = useDietShowNoticeMutation();
  const {
    data: calendarMyDietData,
    isPending: calendarIsPending,
    isFetching,
  } = useStudentCalendarMyDietListQuery({
    startDate: dayjs(currentMonth)
      .subtract(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD'),
    endDate: dayjs(currentMonth).add(1, 'month').endOf('month').format('YYYY-MM-DD'),
  });
  const { mutate: registerMutate, isPending: isRegisterPending } =
    useRegisterDietMutation();

  const monthRightButtonDiabled = dayjs(currentMonth).isSame(dayjs(today), 'month');
  const weekRightButtonDiabled = dayjs(currentWeek.end).isAfter(dayjs(today), 'day');

  const dietDates =
    calendarMyDietData?.uploadDays?.map((item) => {
      return new Date(item);
    }) ?? [];

  // //식단 등록한 날(블루닷)
  const dietDay = (props: DayButtonProps) => {
    const isDiet = dietDates?.some((dietDate) =>
      dayjs(dietDate).isSame(props.day.date, 'day')
    );

    return (
      <DayButton {...props}>
        <div className='day-cell'>
          {props.children}
          {isDiet && <span className='reserved-indicator'></span>}
        </div>
      </DayButton>
    );
  };

  const modifiers = {
    weekHidden: (day: string | number | Date | dayjs.Dayjs | null | undefined) =>
      isArrowToggle &&
      !dayjs(day).isBetween(currentWeek.start, currentWeek.end, null, '[]'),
    disabled: (day: Date) => {
      const isAfterToday = day > today;
      const isReservedDate =
        calendarMyDietData?.uploadDays?.some(
          (dietDate: string) =>
            dayjs(dietDate).toDate().getDate() === day.getDate() &&
            dayjs(dietDate).toDate().getMonth() === day.getMonth() &&
            dayjs(dietDate).toDate().getFullYear() === day.getFullYear()
        ) ?? false;
      return isAfterToday || isReservedDate;
    },
  };

  // //상단 날짜 형식 변경
  const formatCaption: Formatters['formatCaption'] = (date, options) => {
    return `${format(date, 'yyyy', { locale: options?.locale })}년 ${format(date, 'LLLL', { locale: options?.locale })}`;
  };

  const clickCalendarArrow = () => {
    if (date) {
      setCurrentWeek({
        start: dayjs(date).startOf('week').toDate(),
        end: dayjs(date).endOf('week').toDate(),
      });
      setHasMounted(true);
      setCurrentMonth(date);
      setIsArrowToggle((prev) => !prev);
    }
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeekStart =
      direction === 'prev'
        ? dayjs(currentWeek.start).subtract(7, 'days').toDate()
        : dayjs(currentWeek.start).add(7, 'days').toDate();

    const newWeekEnd =
      direction === 'next'
        ? dayjs(currentWeek.end).add(7, 'days').toDate()
        : dayjs(currentWeek.end).subtract(7, 'days').toDate();

    setCurrentWeek({
      start: newWeekStart,
      end: newWeekEnd,
    });

    if (direction === 'prev') {
      dayjs(newWeekStart).month() !== dayjs(currentWeek.start).month()
        ? setCurrentMonth(newWeekStart)
        : setCurrentMonth(currentWeek.start);
    } else {
      setCurrentMonth(currentWeek.end);
    }
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    setCurrentWeek({
      start: dayjs(month).startOf('week').toDate(),
      end: dayjs(month).endOf('week').toDate(),
    });
  };

  const updateRequestData = (
    image: DietImageData
  ): Promise<Partial<RegisterAndEditDiet>> => {
    const isFile = image.fileUrl ? image.fileUrl : null;
    const isFast = image.fileUrl ? false : image.fast;
    return new Promise((resolve) => {
      if (image.type === 'breakfast') {
        const newData = { breakfastFile: isFile, breakfastFast: isFast };
        resolve(newData);
        return newData;
      } else if (image.type === 'lunch') {
        const newData = { lunchFile: isFile, lunchFast: isFast };
        resolve(newData);
        return newData;
      } else {
        const newData = { dinnerFile: isFile, dinnerFast: isFast };
        resolve(newData);
        return newData;
      }
    });
  };

  const onClickRegisterDiet = async () => {
    const updatedDataArray: Partial<RegisterAndEditDiet>[] = await Promise.all(
      images.map(updateRequestData)
    );

    const newRequestData = updatedDataArray.reduce(
      (acc: RegisterAndEditDiet, cur: Partial<RegisterAndEditDiet>) => {
        return { ...acc, ...cur };
      },
      defaultRequestData
    );

    if (JSON.stringify(newRequestData) !== JSON.stringify(defaultRequestData)) {
      registerMutate(
        { ...newRequestData, eatDate: dayjs(date).format('YYYY-MM-DD') },
        {
          onSuccess: async ({ message }) => {
            successToast(message);
            await queryClient.refetchQueries({
              queryKey: ['studentCalendarMyDietList'],
            });

            setDate(undefined);
          },
          onError: (error) => {
            errorToast(error?.response?.data.message ?? 'error');
          },
        }
      );
    } else {
      errorToast('식단을 등록해주세요');
    }
  };

  const handleCloseNotification = () => {
    noticeMutate('DISABLE', {
      onSuccess: () => {
        void queryClient.refetchQueries({
          queryKey: ['studentCalendarMyDietList'],
        });
      },
    });
  };

  useEffect(() => {
    initialImages();
  }, [calendarMyDietData]);

  useEffect(() => {
    if (calendarMyDietData && !isFetching) {
      setHasMounted(false);
    }
  }, [calendarMyDietData, isFetching]);

  return (
    <Layout>
      <Layout.Header className='bg-white'>
        <button onClick={() => router.back()}>
          <IconBack />
        </button>
        <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          식단 올리기
        </h2>
      </Layout.Header>
      <Layout.Contents>
        <article className='calendar-shadow rounded-br-lg rounded-bl-lg bg-white'>
          {calendarMyDietData?.dietNoticeStatus === 'ENABLED' && (
            <div className='flex items-center justify-between bg-blue-50 px-7 py-5'>
              <div className='flex items-center justify-center'>
                <IconNotification width={12} height={12} stroke='black' />
                <p className={cn(Typography.BODY_3, 'ml-3 text-black')}>
                  식단을 등록하지 않은 지난 날짜만 업로드 가능합니다.
                </p>
              </div>
              <Button
                variant='ghost'
                className='h-auto p-0'
                onClick={handleCloseNotification}>
                <IconClose />
                {/* <IconClose width={12} height={12} /> TODO: 추후변경*/}
              </Button>
            </div>
          )}

          {calendarIsPending ? (
            <div
              className={cn(
                isArrowToggle ? 'h-[150px]' : 'h-[364px]',
                'flex w-full items-center justify-center'
              )}>
              <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
            </div>
          ) : (
            <div
              className={cn(
                'relative',
                hasMounted
                  ? isArrowToggle
                    ? 'animate-calendar-accordion-up fill-mode-forwards'
                    : 'animate-calendar-accordion-down fill-mode-forwards'
                  : isArrowToggle
                    ? 'h-[150px]'
                    : '',
                'overflow-hidden px-7 pt-8 pb-6'
              )}>
              <div className='absolute top-8 right-7 z-10 flex items-center gap-8 py-2'>
                <button
                  onClick={
                    !isArrowToggle
                      ? () =>
                          handleMonthChange(
                            dayjs(currentMonth).subtract(1, 'month').toDate()
                          )
                      : () => handleWeekChange('prev')
                  }
                  className='flex-center h-6 w-6'>
                  <IconArrowLeft stroke={'#000'} />
                </button>
                <button
                  onClick={
                    !isArrowToggle
                      ? () =>
                          handleMonthChange(dayjs(currentMonth).add(1, 'month').toDate())
                      : () => handleWeekChange('next')
                  }
                  disabled={
                    !isArrowToggle ? monthRightButtonDiabled : weekRightButtonDiabled
                  }
                  className='flex-center h-6 w-6'>
                  {!isArrowToggle ? (
                    <IconArrowRight
                      stroke={monthRightButtonDiabled ? 'var(--gray-400)' : '#000'}
                    />
                  ) : (
                    <IconArrowRight
                      stroke={weekRightButtonDiabled ? 'var(--gray-400)' : '#000'}
                    />
                  )}
                </button>
              </div>

              <Calendar
                mode='single'
                required
                selected={date}
                onSelect={setDate}
                disabled={modifiers.disabled}
                month={currentMonth}
                onDayClick={handleMonthChange}
                onMonthChange={handleMonthChange}
                formatters={{ formatCaption }}
                modifiersStyles={{
                  weekHidden: { display: 'none' }, // 주간 표시할때 비활성화된 날짜 숨기기
                }}
                fixedWeeks={true}
                modifiers={{
                  weekHidden: modifiers.weekHidden,
                  reserved: dietDates,
                }}
                components={{
                  DayButton: dietDay, //예약한 날 표시(블루닷)
                }}
                classNames={{ nav: 'hidden' }}
                isToggle={isArrowToggle}
              />
            </div>
          )}

          <Button
            className={cn(isArrowToggle ? '' : 'rotate-180', 'm-auto flex pb-7')}
            variant='ghost'
            onClick={clickCalendarArrow}>
            <DownIcon width={16} height={17} stroke={'var(--gray-600)'} />
          </Button>
        </article>

        <div className='flex flex-col justify-between px-7 pt-6 pb-8'>
          {images && date && (
            <Card className='w-full'>
              <CardHeader className={cn(Typography.TITLE_3, 'mb-4 text-gray-600')}>
                {dayjs(date).format('MM월 DD일 (dd)')}
              </CardHeader>
              <CardContent>
                <article className='flex items-center justify-between'>
                  {images.map((diet) => {
                    return <DailyDiet key={diet.type} diet={diet} />;
                  })}
                </article>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout.Contents>
      <Layout.BottomArea className='px-7 pt-7 pb-10'>
        <Button
          size='full'
          onClick={onClickRegisterDiet}
          disabled={isRegisterPending}
          className={cn(Typography.TITLE_1_BOLD, 'text-white')}>
          {isRegisterPending ? (
            <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
          ) : (
            '등록 완료'
          )}
        </Button>
      </Layout.BottomArea>
    </Layout>
  );
};
