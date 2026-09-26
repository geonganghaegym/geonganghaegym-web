'use client';

import 'dayjs/locale/ko';

import dayjs from 'dayjs';
dayjs.locale('ko');

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useLessonListQuery, useTrainerLogListQuery } from '@/feature/log-class';
import { IconBack, IconCalendarX, IconChat, IconPlus } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout, MonthPicker } from '@/widget';
import { ImageSlide } from '@/widget/image-slide';

interface Props {
  memberId: number;
}

const TrainerLogPage = ({ memberId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const { data } = useTrainerLogListQuery({
    studentId: memberId,
    searchDate: dayjs(selectedMonth).format('YYYY-MM'),
  });
  const { data: lessonList } = useLessonListQuery({
    studentId: memberId,
  });
  const hasUnwrittenLesson = lessonList
    ? lessonList?.filter((item) => item.reviewStatus === '미작성').length > 0
    : false;

  const contents = data?.content;
  const studentName = data?.studentName;

  const title = (studentName ? `${studentName}님 ` : '') + '수업 일지';

  return (
    <Layout>
      <Layout.Header>
        <button onClick={() => router.back()}>
          <IconBack />
        </button>
        <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          {title}
        </h2>
        {lessonList && hasUnwrittenLesson && (
          <Link href={`/trainer/manage/${memberId}/log/write`}>
            <IconPlus fill='black' width={20} height={20} />
          </Link>
        )}
        {lessonList && !hasUnwrittenLesson && (
          <AlertDialog>
            <AlertDialogTrigger>
              <IconPlus fill='black' width={20} height={20} />
            </AlertDialogTrigger>
            <AlertDialogContent className='gap-0 px-7 py-8'>
              <AlertDialogTitle className={cn(Typography.HEADING_4_BOLD, 'mb-8')}>
                수업 일지가 모두 작성 완료되었습니다.
              </AlertDialogTitle>
              <AlertDialogFooter className='flex flex-row gap-3'>
                <AlertDialogCancel
                  className={cn(
                    Typography.TITLE_1_SEMIBOLD,
                    'flex-center h-full w-full bg-primary-500 py-[13px] text-white'
                  )}>
                  확인
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Layout.Header>
      <Layout.Contents className='overflow-y-hidden py-7'>
        <div className='px-7'>
          <MonthPicker
            date={selectedMonth}
            onChangeDate={(newDate) => setSelectedMonth(newDate)}
          />
        </div>
        {contents && contents.length > 0 && (
          <div className='hide-scrollbar mt-1 flex h-full flex-1 grow flex-col overflow-y-auto px-7 pb-7'>
            <div className='mb-7 flex w-full flex-col gap-y-6 pb-6'>
              {contents.map((log) => {
                return (
                  <Link key={log.id} href={`${pathname}/${log.id}`}>
                    <Card className='w-full gap-0 px-6 py-7'>
                      <CardHeader className={cn(Typography.TITLE_3)}>
                        {log.lessonDt}
                        {` `}
                        {log.lessonTime}
                      </CardHeader>
                      <CardContent className='mt-4'>
                        <ImageSlide images={log.files} />
                        <p
                          className={cn(
                            Typography.BODY_3,
                            'mt-5 line-clamp-2 h-full text-ellipsis text-black'
                          )}>
                          {log.content}
                        </p>
                      </CardContent>
                      <CardFooter className='mt-6 flex items-center gap-2'>
                        <IconChat />
                        <p className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
                          댓글 <span>{log.commentTotalCount}</span>
                        </p>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {contents && contents.length === 0 && (
          <div className='flex h-full flex-col items-center justify-center space-y-4'>
            <IconCalendarX width={42} height={42} />
            <p className={cn(Typography.HEADING_4_SEMIBOLD, 'text-gray-400')}>
              수업 일지 내역이 없습니다.
            </p>
          </div>
        )}
      </Layout.Contents>
    </Layout>
  );
};

export { TrainerLogPage };
