'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import {
  CourseCard,
  CourseCardContent,
  CourseCardHeader,
  courseHistoryTypes,
  useAddStudentCourseMutation,
  useDeleteStudentCourseMutation,
  useRegisterStudentCourseMutation,
  useStudentCourseDetailQuery,
} from '@/feature/course';
import {
  CourseSheet,
  CourseSheetContent,
  CourseSheetFooter,
  CourseSheetHeader,
  CourseSheetInput,
  CourseSheetTrigger,
} from '@/feature/manage/ui/CourseBottomSheet';
import { IconBack, IconPlus } from '@/shared/assets';
import { IconNotification } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout, MonthPicker } from '@/widget';

import { useStudentInfo } from '../hooks/useStudentInfo';

interface Props {
  memberId: number;
}

const ITEMS_PER_PAGE = 20;

export const StudentCourseDetailPage = ({ memberId }: Props) => {
  const { successToast, errorToast } = useToast();
  const router = useRouter();
  const { memberInfo } = useStudentInfo(memberId);
  const date = new Date();
  const [searchMonth, setSearchMonth] = useState<Date>(date);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isRegisterSheetOpen, setIsRegisterSheetOpen] = useState(false);
  const [addInput, setAddInput] = useState('');
  const [registerInput, setRegisterInput] = useState('');

  const queryClient = useQueryClient();
  const [ref, inView] = useInView({
    threshold: 0.5,
  });

  const {
    data: historyData,
    isPending,
    hasNextPage,
    fetchNextPage,
  } = useStudentCourseDetailQuery({
    memberId,
    size: ITEMS_PER_PAGE,
    searchDate: dayjs(searchMonth).format('YYYY-MM'),
  });

  const { mutate: addMutation } = useAddStudentCourseMutation();
  const { mutate: deleteMutation } = useDeleteStudentCourseMutation();
  const { mutate: registerMutation } = useRegisterStudentCourseMutation();

  const studentCourseId = Number(historyData?.pages[0]?.mainData.course?.courseId);

  const registerCourseCount = () => {
    registerMutation(
      {
        memberId: memberId,
        lessonCnt: Number(registerInput),
      },
      {
        onSuccess: (reslut) => {
          setIsRegisterSheetOpen(false);
          void queryClient.invalidateQueries({
            queryKey: ['studentCourseHistory'],
          });
          successToast(reslut.message);
          return;
        },
        onError: (error) => {
          errorToast(error.response?.data.message);
        },
      }
    );
  };

  const addCourseCount = () => {
    addMutation(
      {
        courseId: studentCourseId,
        memberId: memberId,
        calculation: 'PLUS',
        type: 'PLUS_CNT',
        updateCnt: addInput,
      },
      {
        onSuccess: () => {
          setIsAddSheetOpen(false);
          void queryClient.invalidateQueries({
            queryKey: ['studentCourseHistory'],
          });
          successToast(`${addInput}회가 연장되었습니다.`);
          return;
        },
        onError: (error) => {
          errorToast(error.response?.data.message);
        },
      }
    );
  };

  const deleteStudentCourse = () => {
    deleteMutation(studentCourseId, {
      onSuccess: (result) => {
        void queryClient.invalidateQueries({
          queryKey: ['studentCourseHistory'],
        });
        successToast(result.message);
        return;
      },
      onError: (error) => {
        errorToast(error.response?.data.message);
      },
    });
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(() => {
        throw new Error('Error fetching next page');
      });
    }
  }, [fetchNextPage, hasNextPage, inView]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['studentCourseHistory'] });
    };
  }, [queryClient]);

  return (
    <Layout type='trainer'>
      <Layout.Header className='justify-start bg-white'>
        <button onClick={() => router.back()}>
          <IconBack />
        </button>
        <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          {memberInfo?.name && `${memberInfo.name}님 수강권`}
        </h2>

        {historyData?.pages[0]?.mainData.course?.totalLessonCnt ===
          historyData?.pages[0]?.mainData.course?.completedLessonCnt && (
          <CourseSheet isOpen={isRegisterSheetOpen} setIsOpen={setIsRegisterSheetOpen}>
            <CourseSheetTrigger className='absolute right-7'>
              <IconPlus width={20} height={20} fill='black' />
            </CourseSheetTrigger>
            <CourseSheetContent>
              <CourseSheetHeader>등록할 수업횟수</CourseSheetHeader>
              <CourseSheetInput
                courseInput={registerInput}
                setCourseInput={setRegisterInput}
                isOpen={isRegisterSheetOpen}
              />
              <CourseSheetFooter
                courseInput={registerInput}
                clickButtonHandler={registerCourseCount}>
                수강권 등록
              </CourseSheetFooter>
            </CourseSheetContent>
          </CourseSheet>
        )}
      </Layout.Header>
      <Layout.Contents>
        {isPending ? (
          <div className='flex h-full items-center justify-center'>
            <Image src='/images/loading.gif' width={30} height={30} alt='loading' />
          </div>
        ) : (
          <>
            {/* 수강권 있을때 */}
            {historyData?.pages[0]?.mainData.course && (
              <div className='bg-white p-7 pb-0'>
                <CourseCard
                  className='mb-6'
                  expiration={
                    historyData?.pages[0]?.mainData.course?.totalLessonCnt ===
                    historyData?.pages[0]?.mainData.course?.completedLessonCnt
                  }>
                  <CourseCardHeader
                    gymName={historyData?.pages[0]?.mainData.gymName}
                    totalLessonCnt={
                      historyData?.pages[0]?.mainData.course?.totalLessonCnt
                    }
                    remainLessonCnt={
                      historyData?.pages[0]?.mainData.course?.remainLessonCnt
                    }
                    completedLessonCnt={
                      historyData?.pages[0]?.mainData.course?.completedLessonCnt
                    }
                  />
                  <CourseCardContent
                    totalLessonCnt={
                      historyData?.pages[0]?.mainData.course?.totalLessonCnt
                    }
                    completedLessonCnt={
                      historyData?.pages[0]?.mainData.course?.completedLessonCnt
                    }
                    progressClassName={cn(
                      historyData?.pages[0]?.mainData.course?.completedLessonCnt ===
                        historyData?.pages[0]?.mainData.course?.totalLessonCnt &&
                        'bg-gray-400'
                    )}
                  />
                </CourseCard>

                <div className='mb-7 flex items-center justify-center rounded-lg bg-gray-100 text-black'>
                  <CourseSheet isOpen={isAddSheetOpen} setIsOpen={setIsAddSheetOpen}>
                    <CourseSheetTrigger
                      className={cn('h-[46px] w-[160px]', Typography.HEADING_5)}
                      disabled={
                        historyData?.pages[0]?.mainData.course?.totalLessonCnt ===
                        historyData?.pages[0]?.mainData.course?.completedLessonCnt
                      }>
                      수업 횟수 추가
                    </CourseSheetTrigger>
                    <CourseSheetContent>
                      <CourseSheetHeader>추가할 수업횟수</CourseSheetHeader>
                      <CourseSheetInput
                        courseInput={addInput}
                        setCourseInput={setAddInput}
                        isOpen={isAddSheetOpen}
                      />
                      <CourseSheetFooter
                        courseInput={addInput}
                        clickButtonHandler={addCourseCount}>
                        수업 횟수 추가
                      </CourseSheetFooter>
                    </CourseSheetContent>
                  </CourseSheet>

                  <span className='h-[30px] w-px bg-gray-200'></span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='ghost'
                        className={cn('h-[46px] w-[160px]', Typography.HEADING_5)}>
                        수강권 삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className='py-11'>
                      <AlertDialogHeader className='mb-8 text-center'>
                        <AlertDialogTitle className={cn(Typography.TITLE_1)}>
                          수강권을 삭제하시겠습니까?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter className='grid w-full grid-cols-2 items-center justify-center gap-3'>
                        <AlertDialogCancel className='mt-0 h-12 rounded-md bg-gray-100 text-base font-normal text-gray-600'>
                          아니요
                        </AlertDialogCancel>
                        <AlertDialogAction
                          asChild
                          className='mt-0 h-12 rounded-md bg-point text-base font-normal text-white'>
                          <Button variant='ghost' onClick={deleteStudentCourse}>
                            예
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className='flex justify-end'>
                  <MonthPicker
                    date={searchMonth}
                    onChangeDate={(newDate) => setSearchMonth(newDate)}
                  />
                </div>
              </div>
            )}

            {/* 수강권 없을때 */}
            {!historyData?.pages[0]?.mainData.course && (
              <div className='flex flex-col items-center justify-center bg-white py-[88px]'>
                <p className={cn('mb-3 text-gray-500', Typography.TITLE_3)}>
                  등록된 수강권이 없습니다.
                </p>
                <CourseSheet
                  isOpen={isRegisterSheetOpen}
                  setIsOpen={setIsRegisterSheetOpen}>
                  <CourseSheetTrigger
                    className={cn(
                      'flex h-[37px] w-[112px] items-center justify-center rounded-full border border-primary-500 text-primary-500',
                      Typography.TITLE_3
                    )}>
                    수강권 등록
                  </CourseSheetTrigger>
                  <CourseSheetContent>
                    <CourseSheetHeader>등록할 수업횟수</CourseSheetHeader>
                    <CourseSheetInput
                      courseInput={registerInput}
                      setCourseInput={setRegisterInput}
                      isOpen={isRegisterSheetOpen}
                    />
                    <CourseSheetFooter
                      courseInput={registerInput}
                      clickButtonHandler={registerCourseCount}>
                      수강권 등록
                    </CourseSheetFooter>
                  </CourseSheetContent>
                </CourseSheet>
              </div>
            )}

            <ul className='bg-gray-100'>
              {historyData?.pages?.map((data, index) => {
                if (data.content === null || data.content.length === 0) {
                  return (
                    <li
                      key={`courseHistories_${index}`}
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
                      수강권 내역이 없습니다.
                    </li>
                  );
                } else {
                  return data.content?.map((item) => {
                    const date = dayjs(item.createdAt);
                    const formattedDate = date.format('YY.MM.DD');

                    return (
                      <li className='px-7 py-8' key={item.courseHistoryId}>
                        <p className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
                          {formattedDate}
                        </p>
                        <dl className='flex items-center justify-between'>
                          <dt className={cn(Typography.TITLE_3, 'text-gray-700')}>
                            {courseHistoryTypes[item.type]}
                          </dt>
                          <dd className={cn(Typography.TITLE_3, 'text-black')}>
                            {item.calculation === 'PLUS' ? '+' : '-'}
                            {item.cnt}
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
