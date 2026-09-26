'use client';

import 'dayjs/locale/ko';

import dayjs from 'dayjs';
dayjs.locale('ko');
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { pointHistoryTypes, useStudentPointHistoryQuery } from '@/feature/point';
import { IconClose, IconNotification } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout, MonthPicker } from '@/widget';

import { useStudentInfo } from '../hooks/useStudentInfo';

interface Props {
  memberId: number;
}

const ITEMS_PER_PAGE = 20;

export const StudentPointDetailPage = ({ memberId }: Props) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const { memberInfo } = useStudentInfo(memberId);

  const queryClient = useQueryClient();
  const [ref, inView] = useInView({
    threshold: 0.5,
  });

  const {
    data: historyData,
    isPending,
    hasNextPage,
    fetchNextPage,
  } = useStudentPointHistoryQuery({
    size: ITEMS_PER_PAGE,
    searchDate: dayjs(selectedMonth).format('YYYY-MM'),
    memberId,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(() => {
        throw new Error('Error fetching next page');
      });
    }
  }, [fetchNextPage, hasNextPage, inView]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['myPointHistory'] });
    };
  }, [queryClient]);

  const month = dayjs(historyData?.pages[0]?.mainData.searchDate)
    .format('MM')
    .split('')[1];

  return (
    <Layout type='trainer'>
      <Layout.Header className='justify-start bg-white'>
        <Link href='./' className='h-full w-full'>
          <IconClose width={14} height={14} />
        </Link>
        <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          {`${memberInfo?.name}님 포인트`}
        </h2>
      </Layout.Header>
      <Layout.Contents>
        {isPending ? (
          <div className='loading'>Loading..</div>
        ) : (
          <>
            <div className='bg-white p-7 pb-11 pt-6'>
              <MonthPicker
                date={selectedMonth}
                onChangeDate={(newDate) => setSelectedMonth(newDate)}
              />
              <Card className='mb-6 w-full gap-y-1 bg-primary-500 px-6 py-7'>
                <CardHeader className='flex items-center justify-between'>
                  <p className={cn(Typography.HEADING_5, 'text-white')}>
                    {`${month}월 활동 포인트`}
                  </p>

                  <div className='flex items-center justify-between'>
                    <Image
                      src='/images/point.png'
                      width={21}
                      height={21}
                      alt='point'
                      className={cn('h-fit rounded-full')}
                      priority
                    />
                    <span className={cn(Typography.HEADING_4, 'ml-1 text-white')}>
                      {historyData?.pages[0].mainData.monthPoint}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className='flex items-center justify-between'>
                    <dt className={cn(Typography.BODY_4_MEDIUM, 'text-blue-100')}>
                      누적
                    </dt>
                    <dd className={cn(Typography.BODY_3, 'text-white')}>
                      {historyData?.pages[0].mainData.totalPoint}
                    </dd>
                  </dl>
                </CardContent>
              </Card>
              <p className={cn(Typography.BODY_4, 'flex items-center justify-start')}>
                <IconNotification width={12} height={12} stroke='black' />
                <span className='ml-1'>활동 포인트는 매월 1일 자정 초기화됩니다.</span>
              </p>
            </div>

            <ul className='bg-gray-100'>
              {historyData?.pages?.map((data, index) => {
                if (data.content === null || data.content.length === 0) {
                  return (
                    <li
                      key={`pointHistories_${index}`}
                      className={cn(
                        Typography.TITLE_1_BOLD,
                        'flex flex-col items-center justify-center py-28 text-gray-700'
                      )}>
                      <span className='mb-5 w-[35px]'>
                        <IconNotification
                          width={33}
                          height={33}
                          stroke='var(--gray-300)'
                        />
                      </span>
                      포인트 내역이 없습니다.
                    </li>
                  );
                } else {
                  return data.content?.map((item) => {
                    const date = dayjs(item?.createdAt);
                    const formattedDate = date.format('YY.MM.DD');

                    return (
                      <li className='px-7 py-8' key={item.pointId}>
                        <p className={cn(Typography.BODY_4, 'text-gray-500')}>
                          {formattedDate}
                        </p>
                        <dl className='flex items-center justify-between'>
                          <dt className={cn(Typography.TITLE_3, 'text-gray-700')}>
                            {pointHistoryTypes[item.type]}
                          </dt>
                          <dd className={cn(Typography.TITLE_3, 'text-black')}>
                            {item.calculation === 'PLUS' ? '+' : '-'}
                            {item.point}
                          </dd>
                        </dl>
                      </li>
                    );
                  });
                }
              })}
            </ul>

            {!historyData?.pages[historyData?.pages.length - 1].isLast && hasNextPage && (
              <div ref={ref} className='flex items-center justify-center py-3'>
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              </div>
            )}
          </>
        )}
      </Layout.Contents>
    </Layout>
  );
};
