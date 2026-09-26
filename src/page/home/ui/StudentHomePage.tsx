'use client';

import 'dayjs/locale/ko';

import { hasNativePushBridge } from '@/shared/lib/native-push';
dayjs.locale('ko');
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import dayjs from 'dayjs';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect } from 'react';

import { firebaseApp } from '@/app/_providers/Firebase';
import { useHomeAlarmQuery } from '@/entity/alarm';
import { useRegisterTokenMutation } from '@/feature/alarm';
import { CourseCard, CourseCardContent, CourseCardHeader } from '@/feature/course';
import { useStudentHomeDataQuery } from '@/feature/home';
import { TodayDiet } from '@/feature/log-diet';
import {
  IconAlarm,
  IconArrowDown,
  IconArrowFilledDown,
  IconArrowFilledUp,
  IconArrowRightSmall,
  IconAvatar,
  IconCheck,
  IconLogo,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Card,
  CardContent,
  CardHeader,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const MAX_RETRY_ATTEMPTS = 3;

export const StudentHomePage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isPending } = useStudentHomeDataQuery();
  const { data: homeAlarmData } = useHomeAlarmQuery();
  const { mutate } = useRegisterTokenMutation();

  const month = dayjs(new Date()).format('YYYY-MM');
  const nextScheduledDay = data?.myReservation
    ? dayjs(data?.myReservation?.lessonDt).format('MM.DD (ddd)')
    : '';
  const nextScheduledHour = data?.myReservation
    ? dayjs(data?.myReservation?.lessonStartTime, 'HH:mm:ss').format('A hh:mm')
    : '';

  const toggleArrow = () => {
    setIsOpen((prev) => !prev);
  };

  const attemptToGetToken = async (
    messaging: Messaging,
    registration: ServiceWorkerRegistration,
    attempt = 1
  ) => {
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (currentToken) {
        mutate(currentToken, {
          onSuccess: () => {
            localStorage.setItem('serviceWorkerRegistration', currentToken);
          },
          onError: (error) => {
            throw new Error(error?.response?.data.message ?? 'Mutation error occurred.');
          },
        });
      }
    } catch {
      // 최종 실패(알림 거부·미지원 브라우저 등)는 사용자가 조치할 수 없어 알리지 않는다
      if (attempt < MAX_RETRY_ATTEMPTS) {
        await attemptToGetToken(messaging, registration, attempt + 1);
      }
    }
  };

  const onMessageFCM = async () => {
    if (hasNativePushBridge()) return;
    //서비스워커의 토큰은 한번 등록하면 안바뀜
    if (!('serviceWorker' in navigator && 'Notification' in window)) return;
    // 알림을 거부했으면 토큰을 받을 수 없다
    if (Notification.permission === 'denied') return;
    if (localStorage.getItem('serviceWorkerRegistration')) return;

    const messaging = getMessaging(firebaseApp);
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    await attemptToGetToken(messaging, registration);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    onMessageFCM();
  }, []);

  return (
    <Layout type='student'>
      <Layout.Header>
        <IconLogo width={28} height={28} />
        <Link href={'/student/alarm'} className='relative'>
          <span
            className={
              homeAlarmData ? 't-0 absolute right-0 h-1 w-1 rounded-full bg-point' : ''
            }
          />
          <IconAlarm width={24} height={24} />
        </Link>
      </Layout.Header>
      <Layout.Contents className='p-7 pt-6'>
        {isPending ? (
          <div className='flex h-[500px] w-full items-center justify-center'>
            <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
          </div>
        ) : (
          <>
            <article className='mb-7'>
              {/* 수강권 있을때 */}
              {data?.course && (
                <CourseCard
                  expiration={
                    data.course?.completedLessonCnt === data.course?.totalLessonCnt
                  }>
                  <Link href='./student/course-history'>
                    <CourseCardHeader
                      gymName={data?.gym.name}
                      totalLessonCnt={data?.course.totalLessonCnt}
                      remainLessonCnt={data?.course.remainLessonCnt}
                      completedLessonCnt={data?.course.completedLessonCnt}
                    />
                    <CourseCardContent
                      totalLessonCnt={data?.course.totalLessonCnt}
                      completedLessonCnt={data?.course.completedLessonCnt}
                      progressClassName={cn(
                        data?.course.completedLessonCnt === data?.course.totalLessonCnt &&
                          'bg-gray-400'
                      )}
                    />
                  </Link>
                  {data?.course.completedLessonCnt !== data.course?.totalLessonCnt ? (
                    <Collapsible className='rounded-bl-lg rounded-br-lg bg-primary-600'>
                      <CollapsibleTrigger
                        className='w-full text-white'
                        onClick={toggleArrow}>
                        <div className='flex h-[54px] items-center justify-between p-6'>
                          <p className={cn(Typography.HEADING_5)}>
                            {data?.point.searchDate.split('-')[1].split('')[1]}월 활동
                            포인트
                          </p>
                          <div
                            className={cn(
                              Typography.TITLE_1,
                              'flex items-center justify-center'
                            )}>
                            {isOpen ? (
                              <IconArrowDown
                                widht={14}
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
                                    {data?.point.monthPoint}
                                  </span>
                                </p>
                                <IconArrowDown widht={14} height={14} />
                              </>
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className='p-6 pt-3'>
                        <ul className='flex'>
                          <li className='w-[130px]'>
                            <Link href='./student/point-history'>
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
                                    {data?.point.monthPoint}
                                    <span
                                      className={cn(
                                        Typography.HEADING_5,
                                        'ml-[2px] text-gray-700'
                                      )}>
                                      점
                                    </span>
                                  </p>
                                  <span
                                    className={cn(Typography.BODY_4, 'text-gray-400')}>
                                    누적 {data?.point.totalPoint}
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
                                  {data?.rank.ranking === 999 ? (
                                    '-'
                                  ) : (
                                    <>
                                      <span>{data?.rank.ranking}</span>
                                      <span
                                        className={cn(
                                          Typography.HEADING_5,
                                          'ml-[2px] mr-1 text-gray-700'
                                        )}>
                                        위
                                      </span>
                                    </>
                                  )}

                                  {data?.rank?.ranking ===
                                  data?.rank?.lastMonthRanking ? (
                                    ''
                                  ) : data?.rank &&
                                    data?.rank.ranking > data?.rank.lastMonthRanking ? (
                                    <IconArrowFilledDown fill='var(--primary-500)' />
                                  ) : (
                                    <IconArrowFilledUp fill='var(--point-color)' />
                                  )}
                                </p>
                                <span className={cn(Typography.BODY_4, 'text-gray-400')}>
                                  총 {data?.rank.totalMemberCnt}명
                                </span>
                              </CardContent>
                            </Card>
                          </li>
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <div className='w-full rounded-bl-lg rounded-br-lg bg-gray-400 text-white'>
                      <div className='flex h-[54px] items-center justify-between p-6'>
                        <p className={cn(Typography.HEADING_5)}>
                          {data?.point.searchDate.split('-')[1].split('')[1]}월 활동
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
                            <span className='ml-[3px]'>{data?.point.monthPoint}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CourseCard>
              )}

              {/* 수강권 없을때 */}
              {!data?.course && (
                <div
                  className={cn(
                    Typography.TITLE_3,
                    'flex h-[127px] w-full items-center justify-center rounded-lg bg-gray-500 text-white'
                  )}>
                  현재 등록된 수강권이 없습니다.
                </div>
              )}
            </article>

            {data?.myReservation && (
              <article className='mb-7'>
                <Link href={'/student/schedule?tab=myReservation'}>
                  <Card className='w-full gap-y-8 px-6 py-7'>
                    <CardHeader className='flex items-center justify-start'>
                      <h2 className={cn(Typography.TITLE_2, 'text-gray-800')}>
                        다음 PT예정일
                      </h2>
                    </CardHeader>
                    <CardContent className='flex items-center justify-start'>
                      <IconCheck fill={'var(--primary-500)'} width={17} height={17} />
                      <p className={cn(Typography.HEADING_4_BOLD, 'ml-3 text-black')}>
                        {nextScheduledDay} {nextScheduledHour}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </article>
            )}

            {data?.lessonHistory && (
              <article className='mb-7'>
                <Card className='w-full gap-y-8 px-6 py-7'>
                  <CardHeader className='flex items-center justify-between'>
                    <div className='flex items-center justify-start'>
                      <h2 className={cn(Typography.TITLE_1_BOLD, 'text-black')}>
                        수업 일지
                      </h2>
                      {data.lessonHistory.feedbackChecked === 'UNREAD' && (
                        <span
                          className={cn(
                            Typography.HEADING_5,
                            'ml-1 inline-block h-7 w-7 rounded-[50%] bg-primary-500 text-center text-white'
                          )}>
                          1
                        </span>
                      )}
                    </div>
                    <Link
                      href='/student/log'
                      className={cn(Typography.BODY_3, 'gray-500 h-auto')}>
                      수업전체
                    </Link>
                  </CardHeader>
                  <Link href={`/student/log/${data?.lessonHistory.id}`}>
                    <CardContent className='flex items-start justify-start'>
                      {data.lessonHistory.trainerProfile ? (
                        <div className='h-9 w-9 overflow-hidden rounded-full border border-gray-100'>
                          <Image
                            src={`${data.lessonHistory.trainerProfile}?w=100&h=100&q=90`}
                            width={28}
                            height={28}
                            alt='trainer profile'
                            className='h-full object-cover'
                          />
                        </div>
                      ) : (
                        <IconAvatar width={28} height={28} />
                      )}

                      <div className='ml-2 w-[calc(100%-34px)] overflow-hidden rounded-lg rounded-tl-none bg-gray-100 p-6'>
                        <p className={cn(Typography.BODY_4, 'line-clamp-2 text-black')}>
                          {data?.lessonHistory.content}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </article>
            )}

            <article className='mb-7'>
              <Card className='w-full gap-y-8 px-6 py-7'>
                <CardHeader className='flex items-center justify-between'>
                  <h2 className={cn(Typography.TITLE_1_BOLD, 'text-black')}>오늘 식단</h2>
                  <Link
                    href={`/student/diet?month=${month}`}
                    className={cn(Typography.BODY_3, 'gray-500 h-auto')}>
                    식단전체
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between'>
                    {data?.diet && (
                      <>
                        <TodayDiet diet={data?.diet.breakfast} type='breakfast' />
                        <TodayDiet diet={data?.diet.lunch} type='lunch' />
                        <TodayDiet diet={data?.diet.dinner} type='dinner' />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </article>

            <article>
              <Card className='w-full p-0'>
                <CardHeader>
                  <Link
                    href='/student/workout'
                    className={cn(
                      Typography.BODY_3,
                      'gray-500 flex h-full items-center justify-between px-6 py-7'
                    )}>
                    <h2 className={cn(Typography.TITLE_1_BOLD, 'text-black')}>
                      개인 운동 기록
                    </h2>
                    <IconArrowRightSmall />
                  </Link>
                </CardHeader>
              </Card>
            </article>
          </>
        )}
      </Layout.Contents>
    </Layout>
  );
};
