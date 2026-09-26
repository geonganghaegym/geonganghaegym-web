'use client';

import dayjs from 'dayjs';
dayjs.locale('ko');

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useStudentLogListQuery } from '@/feature/log-class';
import { IconBack, IconCalendarX, IconChat } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { ImageSlide, Layout, MonthPicker } from '@/widget';

const StudentLogPage = () => {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const { data } = useStudentLogListQuery({
    searchDate: dayjs(selectedMonth).format('YYYY-MM'),
  });

  const contents = data?.content;

  return (
    <Layout>
      <Layout.Header>
        <button onClick={() => router.back()}>
          <IconBack />
        </button>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          수업일지
        </h1>
      </Layout.Header>
      <Layout.Contents className='relative overflow-y-hidden py-7'>
        <div className='px-7'>
          <MonthPicker
            date={selectedMonth}
            onChangeDate={(newDate) => setSelectedMonth(newDate)}
          />
        </div>
        {contents && contents.length > 0 && (
          <div className='hide-scrollbar mt-1 flex h-full flex-1 grow flex-col overflow-y-auto px-7 pb-7'>
            <div className='mb-7 flex w-full flex-col gap-y-6 pb-6'>
              {contents.length > 0 &&
                contents.map((log) => {
                  return (
                    <Link key={log.id} href={`/student/log/${log.id}`}>
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
          <div className='absolute left-0 top-1/2 flex w-full -translate-y-1/2 flex-col items-center justify-center gap-4'>
            <IconCalendarX width={42} height={42} />
            <p className={cn(Typography.HEADING_4_SEMIBOLD, 'text-gray-400')}>
              수업일지 내역이 없습니다.
            </p>
          </div>
        )}
      </Layout.Contents>
    </Layout>
  );
};

export { StudentLogPage };
