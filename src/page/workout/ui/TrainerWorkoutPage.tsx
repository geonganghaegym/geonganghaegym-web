'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { NoWorkout, useWorkoutQuery, WorkoutPost } from '@/feature/workout';
import { IconBack } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { cn } from '@/shared/utils';
import { Layout, MonthPicker } from '@/widget';

const TrainerWorkoutPage = ({ memberId }: { memberId: number }) => {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const searchDate = dayjs(selectedMonth).format('YYYY-MM');

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useWorkoutQuery({
    memberId,
    searchDate,
  });

  const name = data?.pages[0].mainData.name;
  const title = name && `${name}님 ` + '운동기록';

  const [ref, inView] = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(() => {
        throw new Error('Error fetching next page');
      });
    }
  }, [fetchNextPage, hasNextPage, inView]);

  return (
    <Layout>
      <Layout.Header>
        <button onClick={() => router.back()}>
          <IconBack />
        </button>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          {title}
        </h1>
      </Layout.Header>
      <Layout.Contents className='flex flex-col flex-wrap py-7'>
        <MonthPicker
          date={selectedMonth}
          onChangeDate={(newDate) => setSelectedMonth(newDate)}
          className='px-7'
        />
        {data && (
          <div className='hide-scrollbar mt-1 flex h-full flex-1 grow flex-col overflow-y-auto px-7 pb-7'>
            <div>
              {data.pages.map((page, pageIndex) => (
                <div key={pageIndex} className='flex w-full flex-col gap-y-6 pb-6'>
                  {page.content &&
                    page.content.length > 0 &&
                    page.content.map((workout) => {
                      return (
                        <Link
                          key={workout.workoutHistoryId}
                          href={`/trainer/manage/${memberId}/workout/${workout.workoutHistoryId}`}>
                          <WorkoutPost workout={workout} />
                        </Link>
                      );
                    })}
                </div>
              ))}
            </div>
            <div ref={ref} className='flex-center p-7'>
              {isFetchingNextPage && (
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              )}
            </div>
            {!data.pages[0].content?.length && <NoWorkout />}
          </div>
        )}
      </Layout.Contents>
    </Layout>
  );
};

export { TrainerWorkoutPage };
