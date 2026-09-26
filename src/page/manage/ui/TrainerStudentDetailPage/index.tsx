/* eslint-disable @next/next/no-img-element */
'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { MealType } from '@/entity/diet';
import { CourseCard, CourseCardContent, CourseCardHeader } from '@/feature/course';
import {
  IconArrowDown,
  IconArrowFilledDown,
  IconArrowFilledUp,
  IconCheck,
} from '@/shared/assets';
import IconArrowRight from '@/shared/assets/images/icon_arrow_right.svg';
import IconCalendar from '@/shared/assets/images/icon_calendar_blue.svg';
import IconDefaultProfile from '@/shared/assets/images/icon_default_profile.svg';
import IconDumbel from '@/shared/assets/images/icon_dumbel.svg';
import IconEdit from '@/shared/assets/images/icon_edit.svg';
import { Typography } from '@/shared/mixin';
import {
  Card,
  CardContent,
  CardHeader,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui';
import { buildDisplayImageUrl, cn } from '@/shared/utils';
import { Layout } from '@/widget';

import { useStudentInfo } from '../../hooks/useStudentInfo';
import { profileBorderStyleMapper } from '../../utils';
import { Header } from './Header';

interface Props {
  memberId: number;
}

const dietDay: MealType[] = ['breakfast', 'lunch', 'dinner'];

const TrainerStudentDetailPage = ({ memberId }: Props) => {
  const { memberInfo } = useStudentInfo(memberId);
  const [isOpen, setIsOpen] = useState(false);
  const month = dayjs(new Date()).format('YYYY-MM');

  const toggleArrow = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Layout>
      {memberInfo && (
        <>
          <Header name={memberInfo.name} memberId={memberId} />
          <Layout.Contents className='hide-scrollbar p-7 pt-8'>
            <div className='mb-6 flex w-full items-center gap-x-8'>
              {memberInfo.fileUrl ? (
                <Image
                  width={80}
                  height={80}
                  src={`${memberInfo.fileUrl}?w=300&h=300&q=90`}
                  alt='profile'
                  className={cn(
                    'h-[80px] w-[80px] rounded-full border border-gray-300 object-cover',
                    profileBorderStyleMapper(memberInfo.ranking)
                  )}
                />
              ) : (
                <IconDefaultProfile />
              )}
              <div className='flex flex-col'>
                <h2 className={cn('flex gap-x-3', Typography.HEADING_2)}>
                  {memberInfo.name}
                </h2>
                <div
                  className={cn(
                    Typography.BODY_3,
                    'flex items-center gap-x-2 text-gray-500'
                  )}>
                  {memberInfo.nickName && <p>{memberInfo.nickName}</p>}
                  {memberInfo.ranking !== 999 && memberInfo.nickName && (
                    <div className='block h-[11px] w-px bg-gray-300'></div>
                  )}
                  {memberInfo.ranking !== 999 && (
                    <p>
                      랭킹 <span className='text-primary-500'>{memberInfo.ranking}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className='flex items-center justify-center gap-x-3'>
              <Card className='mb-6 flex w-full flex-row items-center justify-between gap-y-9 px-8 py-5 shadow-sm'>
                <Link
                  href={`/trainer/manage/${memberId}/reservation?name=${memberInfo?.name}`}
                  className='flex flex-col items-center justify-between gap-y-3'>
                  <div className='flex h-7 items-center justify-center'>
                    <IconCalendar />
                  </div>
                  <p className={Typography.HEADING_5}>예약 내역</p>
                </Link>
                <div className='h-11 w-px bg-gray-100' />
                <Link
                  href={`/trainer/manage/${memberId}/edit/memo`}
                  className='flex flex-col items-center justify-between gap-y-3'>
                  <div className='flex h-7 items-center justify-center'>
                    <IconEdit />
                  </div>
                  <p className={Typography.HEADING_5}>회원 메모</p>
                </Link>
                <div className='h-11 w-px bg-gray-100' />
                <Link
                  href={`/trainer/manage/${memberId}/log`}
                  className='flex flex-col items-center justify-between gap-y-3'>
                  <div className='flex h-7 items-center justify-center'>
                    <IconDumbel />
                  </div>
                  <p className={Typography.HEADING_5}>수업 일지</p>
                </Link>
              </Card>
            </div>

            {/* 수강권 있는 경우 */}
            {memberInfo.course && (
              <CourseCard
                className='mb-6'
                expiration={
                  memberInfo.course?.completedLessonCnt ===
                  memberInfo.course?.totalLessonCnt
                }>
                <Link
                  href={{
                    pathname: `/trainer/manage/${memberId}/course-history`,
                    query: { name: memberInfo.name },
                  }}>
                  <CourseCardHeader
                    gymName={memberInfo.gym.name}
                    totalLessonCnt={memberInfo.course?.totalLessonCnt}
                    remainLessonCnt={memberInfo.course?.remainLessonCnt}
                    completedLessonCnt={memberInfo.course?.completedLessonCnt}
                  />
                  <CourseCardContent
                    progressClassName={cn(
                      memberInfo.course?.completedLessonCnt ===
                        memberInfo.course?.totalLessonCnt && 'bg-gray-400'
                    )}
                    totalLessonCnt={memberInfo.course?.totalLessonCnt}
                    completedLessonCnt={memberInfo.course?.completedLessonCnt}
                  />
                </Link>
                {memberInfo?.course.completedLessonCnt !==
                memberInfo.course?.totalLessonCnt ? (
                  <Collapsible className='rounded-bl-lg rounded-br-lg bg-primary-600'>
                    <CollapsibleTrigger
                      className='w-full text-white'
                      onClick={toggleArrow}>
                      <div className='flex items-center justify-between p-6'>
                        <p className={cn(Typography.HEADING_5)}>
                          {memberInfo?.point?.searchDate.split('-')[1].split('')[1]}월
                          활동 포인트
                        </p>
                        <div
                          className={cn(
                            Typography.TITLE_1,
                            'flex items-center justify-center'
                          )}>
                          {isOpen ? (
                            <IconArrowDown
                              width={14}
                              height={14}
                              className='rotate-180'
                            />
                          ) : (
                            <>
                              <p className='mr-2 flex items-center justify-center'>
                                <Image
                                  src='/images/point.png'
                                  width={21}
                                  height={21}
                                  alt='point'
                                  className={cn('h-fit rounded-full')}
                                  priority
                                />
                                <span className='ml-[3px]'>
                                  {memberInfo?.point?.monthPoint}
                                </span>
                              </p>
                              <IconArrowDown width={14} height={14} />
                            </>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className='p-6 pt-3'>
                      <ul className='flex'>
                        <li className='w-[130px]'>
                          <Link
                            href={{
                              pathname: `/trainer/manage/${memberId}/point-history`,
                              query: { name: memberInfo.name },
                            }}>
                            <Card className='h-full w-full gap-y-7 p-6'>
                              <CardHeader>
                                <p
                                  className={cn(
                                    Typography.HEADING_5,
                                    'flex items-center justify-start text-black'
                                  )}>
                                  <Image
                                    src='/images/point.png'
                                    width={21}
                                    height={21}
                                    alt='point'
                                    className={cn('h-fit rounded-full')}
                                    priority
                                  />
                                  이번달 포인트
                                </p>
                              </CardHeader>
                              <CardContent>
                                <p
                                  className={cn(
                                    Typography.HEADING_2,
                                    'mb-7 flex items-center text-black'
                                  )}>
                                  {memberInfo?.point?.monthPoint}
                                  <span
                                    className={cn(
                                      Typography.HEADING_5,
                                      'ml-[2px] text-gray-700'
                                    )}>
                                    점
                                  </span>
                                </p>
                                <span className={cn(Typography.BODY_4, 'text-gray-400')}>
                                  누적 {memberInfo?.point?.totalPoint}
                                </span>
                              </CardContent>
                            </Card>
                          </Link>
                        </li>
                        <li className='ml-3 w-[130px]'>
                          <Card className='h-full w-full gap-y-7 p-6'>
                            <CardHeader>
                              <p
                                className={cn(
                                  Typography.HEADING_5,
                                  'flex items-center justify-start text-black'
                                )}>
                                랭킹
                              </p>
                            </CardHeader>
                            <CardContent>
                              <p
                                className={cn(
                                  Typography.HEADING_2,
                                  'mb-7 flex items-center text-black'
                                )}>
                                {memberInfo?.rank.ranking === 999 ? (
                                  '-'
                                ) : (
                                  <>
                                    <span>{memberInfo?.rank.ranking}</span>
                                    <span
                                      className={cn(
                                        Typography.HEADING_5,
                                        'ml-[2px] mr-1 text-gray-700'
                                      )}>
                                      위
                                    </span>
                                  </>
                                )}
                                {memberInfo?.rank?.ranking ===
                                memberInfo?.rank?.lastMonthRanking ? (
                                  ''
                                ) : memberInfo?.rank &&
                                  memberInfo?.rank.ranking >
                                    memberInfo?.rank.lastMonthRanking ? (
                                  <IconArrowFilledDown fill='var(--primary-500)' />
                                ) : (
                                  <IconArrowFilledUp fill='var(--point-color)' />
                                )}
                              </p>
                              <span className={cn(Typography.BODY_4, 'text-gray-400')}>
                                총 {memberInfo?.rank.totalMemberCnt}명
                              </span>
                            </CardContent>
                          </Card>
                        </li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <div className='w-full rounded-bl-lg rounded-br-lg bg-gray-400 text-white'>
                    <div className='flex items-center justify-between p-6'>
                      <p className={cn(Typography.HEADING_5)}>
                        {memberInfo?.point?.searchDate.split('-')[1].split('')[1]}월 활동
                        포인트
                      </p>
                      <div
                        className={cn(
                          Typography.TITLE_1,
                          'flex items-center justify-center'
                        )}>
                        <p className='mr-2 flex items-center justify-center'>
                          <Image
                            src='/images/point.png'
                            width={21}
                            height={21}
                            alt='point'
                            className={cn('h-fit rounded-full')}
                            priority
                          />
                          <span className='ml-[3px]'>
                            {memberInfo?.point?.monthPoint}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CourseCard>
            )}

            {/* 수강권 없는 경우 */}
            {!memberInfo.course && (
              <Card
                className={cn(
                  Typography.TITLE_3,
                  'mb-6 flex h-[127px] w-full items-center justify-center rounded-lg bg-gray-500 text-white'
                )}>
                현재 등록된 수강권이 없습니다.
              </Card>
            )}

            {memberInfo.diet.dietId && (
              <Card className='mb-6 w-full gap-y-5 px-6 py-7 shadow-sm'>
                <CardHeader className='mb-7 flex items-center justify-between text-gray-800'>
                  <h4 className={cn(Typography.TITLE_2, 'text-gray-800')}>오늘 식단</h4>
                  <Link href={`/trainer/manage/${memberId}/diet?month=${month}`}>
                    <p className={cn(Typography.BODY_3, 'text-gray-500')}>식단전체</p>
                  </Link>
                </CardHeader>
                <CardContent className='flex justify-center gap-x-2'>
                  <article className='mb-6 flex w-full justify-between gap-2'>
                    {dietDay.map((mealType: MealType) => {
                      const meal = memberInfo.diet[mealType];
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
                                src={buildDisplayImageUrl(meal.dietFile.fileUrl)}
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
                </CardContent>
              </Card>
            )}

            {memberInfo.diet.dietId === null && (
              <Link href={`/trainer/manage/${memberId}/diet?month=${month}`}>
                <Card className='mb-6 w-full gap-y-5 px-6 py-7 shadow-sm'>
                  <CardHeader className='flex items-center justify-between text-gray-800'>
                    <h4 className={cn(Typography.TITLE_2, 'text-gray-800')}>등록 식단</h4>
                    <IconArrowRight />
                  </CardHeader>
                </Card>
              </Link>
            )}
            <Link href={`/trainer/manage/${memberId}/workout`}>
              <Card className='w-full gap-y-5 px-6 py-7 shadow-sm'>
                <CardHeader className='flex items-center justify-between'>
                  <h4 className={cn(Typography.TITLE_2, 'text-gray-800')}>
                    개인 운동 기록
                  </h4>
                  <IconArrowRight />
                </CardHeader>
              </Card>
            </Link>
          </Layout.Contents>
        </>
      )}
    </Layout>
  );
};

export { TrainerStudentDetailPage };
