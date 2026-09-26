/* eslint-disable @next/next/no-img-element */
'use client';

import 'dayjs/locale/ko';

import dayjs from 'dayjs';
dayjs.locale('ko');
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { MealType, useDietListQuery } from '@/entity/diet';
import { useMyInfoQuery } from '@/feature/mypage';
import {
  IconBack,
  IconChat,
  IconCheck,
  IconLike,
  IconNotification,
  IconPlus,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, Card, CardContent, CardFooter, CardHeader } from '@/shared/ui';
import { buildDisplayImageUrl, cn } from '@/shared/utils';
import { Layout, MonthPicker } from '@/widget';

const NoDiet = () => {
  return (
    <li
      className={cn(
        Typography.TITLE_1_BOLD,
        'flex flex-col items-center justify-center py-28 text-gray-700'
      )}>
      <span className='mb-5 w-[35px]'>
        <IconNotification width={33} height={33} stroke='var(--gray-300)' />
      </span>
      등록된 식단이 없습니다.
    </li>
  );
};

const dietDay: MealType[] = ['breakfast', 'lunch', 'dinner'];

const ITEMS_PER_PAGE = 10;

export const StudentDietListPage = () => {
  const today = new Date();
  const searchParams = useSearchParams();
  const month = searchParams.get('month');
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: userInfo } = useMyInfoQuery();

  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    dayjs(month).isValid() ? dayjs(month).toDate() : new Date()
  );
  const [ref, inView] = useInView({
    threshold: 0.5,
  });

  const { data, hasNextPage, fetchNextPage, isPending } = useDietListQuery({
    searchDate: dayjs(selectedMonth).format('YYYY-MM'),
    size: ITEMS_PER_PAGE,
  });

  const onChangeMonth = (month: Date) => {
    setSelectedMonth(month);
    const formattedMonth = dayjs(month).format('YYYY-MM');
    router.push(`/student/diet?month=${formattedMonth}`);
  };

  const onClickDiet = (dietId: number) => {
    router.push(`/student/diet/${dietId}?month=${month}`);
  };

  useEffect(() => {
    if (dayjs(month).isValid()) {
      setSelectedMonth(dayjs(month).toDate());
    }
  }, [month]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(() => {
        throw new Error('Error fetching next page');
      });
    }
  }, [fetchNextPage, hasNextPage, inView]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['dietList'] });
    };
  }, [queryClient]);

  const title = userInfo?.name ? `${userInfo.name}님 식단` : '식단';

  return (
    <Layout>
      {isPending && (
        <div className='flex h-full w-full items-center justify-center'>
          <div ref={ref} className='flex w-full justify-center p-3'>
            <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
          </div>
        </div>
      )}
      {!isPending && (
        <>
          <Layout.Header className='bg-gray-100'>
            <button onClick={() => router.back()}>
              <IconBack />
            </button>
            <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
              {title}
            </h2>
            <Link href='/student/diet/register'>
              <IconPlus width={20} height={20} />
            </Link>
          </Layout.Header>
          <Layout.Contents className='bg-gray-100'>
            <article className='bg-gray-100 px-7 pb-[52px] pt-7'>
              {selectedMonth && (
                <div className='flex justify-start'>
                  <MonthPicker
                    date={selectedMonth}
                    onChangeDate={(newDate) => onChangeMonth(newDate)}
                  />
                </div>
              )}

              <ul>
                {data?.pages.map((item, index) => {
                  if (item.content === null || item.content.length === 0) {
                    return <NoDiet key={`diet_${index}`} />;
                  }

                  return item.content.map((diet) => {
                    const date = dayjs(diet?.eatDate).format('MM월 DD일 (dd)');
                    const todayValue = dayjs(today).format('MM월 DD일 (dd)');
                    return (
                      <li key={diet.dietId}>
                        <Button
                          variant='ghost'
                          size='full'
                          className='p-0'
                          onClick={() => onClickDiet(diet.dietId)}>
                          <Card className='mb-5 w-full px-6 py-7'>
                            <CardHeader
                              className={cn(
                                Typography.TITLE_3,
                                'mb-4 text-left text-gray-600'
                              )}>
                              {date === todayValue ? '오늘' : date}
                            </CardHeader>
                            <CardContent>
                              <article className='mb-6 flex justify-between gap-2'>
                                {dietDay.map((mealType: MealType) => {
                                  const meal = diet[mealType];
                                  return (
                                    <div
                                      key={mealType}
                                      className='flex flex-1 items-center justify-center'>
                                      {meal.fast && (
                                        <div
                                          className={cn(
                                            Typography.TITLE_2,
                                            'flex h-[88px] w-full flex-col items-center justify-center rounded-md bg-gray-100 p-0 text-center text-gray-400'
                                          )}>
                                          <span className='mb-1'>
                                            <IconCheck
                                              fill={'var(--primary-500)'}
                                              width={17}
                                              height={17}
                                            />
                                          </span>
                                          단식
                                        </div>
                                      )}
                                      {!meal.fast && meal.dietFile?.fileUrl && (
                                        <div className='h-[88px] w-full'>
                                          <img
                                            src={buildDisplayImageUrl(
                                              meal.dietFile.fileUrl,
                                              {
                                                w: 400,
                                                q: 90,
                                              }
                                            )}
                                            alt={`${meal.type} image`}
                                            className='custom-image rounded-md'
                                          />
                                        </div>
                                      )}
                                      {!meal.fast && !meal.dietFile && (
                                        <div className='h-[88px] w-full rounded-md bg-gray-100 p-0' />
                                      )}
                                    </div>
                                  );
                                })}
                              </article>

                              <CardFooter className='flex items-center justify-start'>
                                <div className='flex items-center'>
                                  {diet.liked ? (
                                    <IconLike
                                      stroke='var(--point-color)'
                                      fill='var(--point-color)'
                                    />
                                  ) : (
                                    <IconLike stroke='var(--gray-500)' />
                                  )}
                                  <span className='ml-1'>
                                    {diet.likeCnt ? diet.likeCnt : 0}
                                  </span>
                                </div>
                                <div className='ml-4 flex items-center'>
                                  <IconChat />
                                  <p
                                    className={cn(
                                      Typography.BODY_4_MEDIUM,
                                      'ml-1 text-gray-500'
                                    )}>
                                    댓글
                                    <span className='ml-[2px]'>
                                      {diet.commentCnt ? diet.commentCnt : 0}
                                    </span>
                                  </p>
                                </div>
                              </CardFooter>
                            </CardContent>
                          </Card>
                        </Button>
                      </li>
                    );
                  });
                })}
              </ul>

              {!data?.pages[data?.pages.length - 1].isLast && hasNextPage && (
                <div ref={ref} className='flex h-7 items-center justify-center p-3'>
                  <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
                </div>
              )}
            </article>
          </Layout.Contents>
        </>
      )}
    </Layout>
  );
};
