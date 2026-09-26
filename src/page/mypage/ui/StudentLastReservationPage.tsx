'use client';

import 'dayjs/locale/ko';

import dayjs from 'dayjs';
dayjs.locale('ko');
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useStudentMyLastReservationListQuery } from '@/feature/schedule';
import { IconBack, IconNoSchedule } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Card,
  CardContent,
  CardHeader,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from '@/shared/ui';
import { cn, convertTo12HourFormat } from '@/shared/utils';
import { Layout, MonthPicker } from '@/widget';

const NoReservation = () => {
  return (
    <li
      className={cn(
        Typography.TITLE_1_BOLD,
        'flex flex-col items-center justify-center py-28 text-gray-700'
      )}>
      <span className='mb-5 w-[35px]'>
        <IconNoSchedule />
      </span>
      지난 예약이 없습니다.
    </li>
  );
};

const StudentLastReservationPage = () => {
  const searchParams = useSearchParams();
  const month = searchParams.get('month');

  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    dayjs(month).isValid() ? dayjs(month).toDate() : new Date()
  );

  const router = useRouter();
  const { data } = useStudentMyLastReservationListQuery(
    dayjs(selectedMonth).format('YYYY-MM')
  );

  const onChangeMonth = (month: Date) => {
    setSelectedMonth(month);
    const formattedMonth = dayjs(month).format('YYYY-MM');
    router.push(`/student/mypage/last-reservation?month=${formattedMonth}`);
  };

  return (
    <Layout>
      <Layout.Header>
        <Link href={'/student/mypage'}>
          <IconBack />
        </Link>
        <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          지난 예약
        </h2>
      </Layout.Header>
      <Layout.Contents>
        <div className='bg-gray-100 px-7 pb-[52px] pt-7'>
          {selectedMonth && (
            <div className='flex justify-start'>
              <MonthPicker
                date={selectedMonth}
                onChangeDate={(newDate) => onChangeMonth(newDate)}
              />
            </div>
          )}

          <ul>
            {data?.reservations === null && <NoReservation />}

            {data?.reservations?.map((item) => {
              const reservatioDate = dayjs(item?.lessonDt).format('MM월 DD일 dddd');
              const reservatioDateInfo = dayjs(item?.lessonDt).format('MM.DD (dd)');
              const [startTime, period] = convertTo12HourFormat(item?.lessonStartTime);
              const [endTime] = convertTo12HourFormat(item?.lessonEndTime);

              return (
                <li key={item.scheduleId} className='mb-5'>
                  <Sheet>
                    <SheetTrigger className='w-full'>
                      <Card className='w-full px-6 py-7 text-left'>
                        <CardHeader className={cn(Typography.TITLE_3, 'text-gray-600')}>
                          {reservatioDate}
                        </CardHeader>
                        <CardContent className='flex items-center justify-start'>
                          <p
                            className={cn(
                              Typography.TITLE_1_BOLD,
                              'flex items-center justify-start text-black'
                            )}>
                            {period} {startTime} - {endTime}
                          </p>

                          <span
                            className={cn(
                              Typography.BODY_4_MEDIUM,
                              item.reservationStatus === 'COMPLETED'
                                ? 'bg-[#e2f1ff] text-primary-500'
                                : 'bg-gray-100 text-gray-700',
                              'ml-2 w-[52px] rounded-sm py-[2px] text-center '
                            )}>
                            {item.reservationStatus === 'COMPLETED' ? '출석' : '미출석'}
                          </span>
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    <SheetContent headerType='close'>
                      <SheetHeader className='mb-8 '>
                        <h3
                          className={cn(
                            Typography.HEADING_4_BOLD,
                            'text-left text-black'
                          )}>
                          수업 정보
                        </h3>
                      </SheetHeader>

                      <SheetDescription
                        className={cn(
                          'mb-11 rounded-md bg-gray-100 p-6 text-center text-black',
                          Typography.HEADING_3
                        )}>
                        {reservatioDateInfo} {period} {startTime} - {endTime}
                        <span
                          className={
                            item.reservationStatus === 'COMPLETED'
                              ? 'text-black'
                              : 'text-point'
                          }>
                          {item.reservationStatus === 'COMPLETED' ? ' 출석' : ' 미출석'}
                        </span>
                      </SheetDescription>

                      <SheetFooter>
                        <SheetClose
                          className={cn(
                            Typography.TITLE_1_SEMIBOLD,
                            'flex h-12 w-full items-center justify-center rounded-md bg-primary-500 text-white'
                          )}>
                          확인
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </li>
              );
            })}
          </ul>
        </div>
      </Layout.Contents>
    </Layout>
  );
};

export { StudentLastReservationPage };
