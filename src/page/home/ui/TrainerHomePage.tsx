'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { firebaseApp } from '@/app/_providers/Firebase';
import { useHomeAlarmQuery } from '@/entity/alarm';
import { useRegisterTokenMutation } from '@/feature/alarm';
import { useAddStudentCourseMutation } from '@/feature/course';
import { useTrainerHomeQuery } from '@/feature/home';
import { AddStudentDialog } from '@/feature/manage';
import { useMyInfoQuery } from '@/feature/mypage';
import { TrainerSchedule } from '@/feature/schedule';
import { IconAlarmWhite, IconCalendarX, IconMedalGold, IconPlus } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout, TrainerNavigation } from '@/widget';

const MAX_RETRY_ATTEMPTS = 3;

export const TrainerHomePage = () => {
  const queryClient = useQueryClient();
  const { errorToast } = useToast();
  const { mutate: addStudentCourseMutate } = useAddStudentCourseMutation();
  const { mutate: tokenMutate } = useRegisterTokenMutation();

  const { data: userInfo } = useMyInfoQuery();
  const { data: homeInfo } = useTrainerHomeQuery();
  const { data: homeAlarmData } = useHomeAlarmQuery();

  const addCourse = ({ courseId, memberId }: { courseId: number; memberId: number }) => {
    addStudentCourseMutate(
      {
        courseId,
        memberId,
        calculation: 'PLUS',
        type: 'ONE_LESSON',
        updateCnt: '1',
      },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({
            queryKey: ['TrainerHome'],
          });
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  const findClosestSchedule = (
    schedules: TrainerSchedule[] = []
  ): TrainerSchedule | null => {
    const now = dayjs().startOf('hour'); // 현재 시간을 "시" 단위로만 고려
    let closestSchedule: TrainerSchedule | null = null;

    schedules.forEach((schedule) => {
      const lessonStartTime = dayjs(schedule.lessonStartTime).startOf('hour');

      // 현재 시간보다 이전에 시작한 수업은 무시
      if (lessonStartTime.isBefore(now)) {
        return;
      }

      // 현재 시간과 동일하거나 이후에 시작하는 수업 중 가장 가까운 수업을 찾음
      if (
        !closestSchedule ||
        lessonStartTime.isBefore(dayjs(closestSchedule.lessonStartTime).startOf('hour'))
      ) {
        closestSchedule = schedule;
      }
    });

    return closestSchedule;
  };

  const todaySchedule: TrainerSchedule[] | undefined = homeInfo?.todaySchedule.schedule;

  const closestSchedule = findClosestSchedule(todaySchedule);

  const hasTodaySchedule = Array.isArray(todaySchedule) && todaySchedule.length > 0;

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
        tokenMutate(currentToken, {
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
    <Layout className='relative'>
      <div className='absolute left-0 top-0 z-0 h-[170px] w-full bg-primary' />
      <Layout.Header className='z-10'>
        <p className={cn(Typography.TITLE_2, 'text-white')}>{userInfo?.gym.name}</p>
        <Link href={'/trainer/alarm'} className='relative'>
          <span
            className={cn(
              homeAlarmData && 't-0 absolute -right-[2px] h-1 w-1 rounded-full bg-point'
            )}
          />
          <IconAlarmWhite />
        </Link>
      </Layout.Header>
      <Layout.Contents>
        <div className=' flex w-full flex-col gap-y-5 pb-10 pt-8'>
          <h3
            className={cn(
              Typography.HEADING_4_BOLD,
              'z-10 flex gap-x-2 px-7 text-white'
            )}>
            오늘의 수업
          </h3>
          {hasTodaySchedule && (
            <div className='hide-scrollbar z-10 overflow-x-auto'>
              <div className='flex w-[calc(100vw-40px)] gap-0 px-7'>
                {todaySchedule?.map((item) => {
                  const isClosestSchedule =
                    item.scheduleId === closestSchedule?.scheduleId;
                  return (
                    <Link
                      href={`/trainer/manage/${item.applicantId}`}
                      key={item.scheduleId}>
                      <div
                        className={cn(
                          'flex-center mr-4 h-[100px] w-[100px] flex-col gap-4 rounded-md border border-gray-200 bg-white p-8 shadow-sm',
                          isClosestSchedule && 'border-[#00D1FF]'
                        )}>
                        <span className={cn(Typography.BODY_2, 'text-gray-500')}>
                          {item.lessonStartTime}
                        </span>
                        <p className={cn(Typography.TITLE_1_BOLD)}>
                          {item.applicantName}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {!hasTodaySchedule && (
            <div className='px-7'>
              <Card className='flex-center h-[100px] w-full gap-1 shadow-sm'>
                {homeInfo?.todaySchedule.schedule.length === 0 && (
                  <>
                    <IconCalendarX width={42} />
                    <p className={cn(Typography.HEADING_5, 'text-gray-500')}>
                      예약된 수업이 없습니다.
                    </p>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
        <div className='mt-[19px] flex flex-col items-center px-7'>
          <div className='grid w-full grid-cols-2 gap-2'>
            <Link href={'/trainer/manage'}>
              <Card className='h-[140px] w-full shadow-sm'>
                <CardHeader className='relative'>
                  회원
                  <span className='ml-1 text-primary-500'>{homeInfo?.studentCount}</span>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                    }}>
                    <AddStudentDialog>
                      <button className='absolute right-0 top-0'>
                        <IconPlus width={20} fill={'#CBCFD3'} />
                      </button>
                    </AddStudentDialog>
                  </div>
                </CardHeader>
                <CardContent className='relative h-full'>
                  <p>{`간편한 회원 관리와\n운동 일지 공유`}</p>
                  <div className='absolute bottom-0 right-0 h-[60px] w-[60px]'>
                    <Image
                      src='/images/icon_profile_coin_shadow.png'
                      fill
                      sizes='auto'
                      priority
                      alt='Card image of account'
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={'/trainer/manage/feedback'}>
              <Card className='h-[140px] w-full shadow-sm'>
                <CardHeader>피드백 작성</CardHeader>
                <CardContent className='relative h-full'>
                  <p>{`수업 내역 관리와\n피드백 작성`}</p>
                  <div className='absolute bottom-0 right-0 h-[60px] w-[60px]'>
                    <Image
                      src='/images/icon_calendar_shadow.png'
                      fill
                      sizes='auto'
                      alt='Calendar image for classes'
                      priority
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          {homeInfo?.bestStudents && homeInfo.bestStudents.length > 0 && (
            <Card className='shaodw-none mt-6 flex w-full flex-col gap-6'>
              {homeInfo?.bestStudents.map((item) => (
                <div
                  key={item.memberId}
                  className='flex h-fit w-full flex-row items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='relative w-fit'>
                      <IconMedalGold />
                      <span
                        className={cn(
                          Typography.HEADING_5,
                          'absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] text-white'
                        )}>
                        1
                      </span>
                    </div>
                    <div>
                      <p className={cn(Typography.BODY_3, 'text-gray-600')}>
                        {new Date().getMonth() + 1}월의 우수 회원
                      </p>
                      <Link href={`/trainer/manage/${item.memberId}`}>
                        <span className={cn(Typography.TITLE_2)}>{item.name}</span>
                      </Link>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant='secondary'>수강권 지급</Button>
                    </DialogTrigger>
                    <DialogContent className='flex w-[320px] flex-col rounded-md bg-white px-7 py-8'>
                      <h3 className={cn(Typography.HEADING_4_BOLD)}>
                        {item.name}님에게 1회 수강권 지급
                      </h3>
                      <p className={cn(Typography.BODY_1, 'mt-3 text-gray-600')}>
                        우수회원 수강권 지급은 한달에 1번 가능합니다. 추가 지급은 수강권
                        횟수 추가를 이용해주세요.
                      </p>
                      <div className='mt-8 flex w-full gap-3'>
                        <DialogClose asChild>
                          <Button
                            variant='secondary'
                            size='full'
                            className={cn(Typography.TITLE_1_SEMIBOLD, 'py-4')}>
                            아니요
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            variant='default'
                            size='full'
                            className={cn(Typography.TITLE_1_SEMIBOLD, 'py-4')}
                            onClick={() =>
                              addCourse({
                                courseId: item.courseId,
                                memberId: item.memberId,
                              })
                            }>
                            예
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </Card>
          )}
        </div>
      </Layout.Contents>
      <Layout.BottomArea className='p-0'>
        <TrainerNavigation />
      </Layout.BottomArea>
    </Layout>
  );
};
