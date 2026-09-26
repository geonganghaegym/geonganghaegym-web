'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

import {
  LogStudentCommentContext,
  LogStudentCommentInput,
  LogStudentCommentList,
  useLogDetailQuery,
  useLogStudentComment,
} from '@/feature/log-class';
import { IconBack, IconChat } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { ImageSlide, Layout } from '@/widget';

interface Props {
  logId: number;
}

const StudentLogDetailPage = ({ logId }: Props) => {
  const router = useRouter();
  const { data } = useLogDetailQuery({ lessonHistoryId: logId });

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const value = useLogStudentComment({ logId, ref: inputRef });

  return (
    <Layout>
      <Layout.Header>
        <button onClick={() => router.back()}>
          <IconBack />
        </button>
      </Layout.Header>
      {data && (
        <LogStudentCommentContext.Provider value={value}>
          <Layout.Contents className='px-7'>
            <div className='flex justify-between pb-4 pt-6'>
              <h3 className={cn(Typography.TITLE_1_BOLD)}>{data.student}님 수업 일지</h3>
            </div>
            <Card className='w-full px-0 pb-0'>
              <CardHeader className={cn(Typography.TITLE_3, 'px-6')}>
                {data?.lessonDt}
                {` `}
                {data.lessonTime}
              </CardHeader>
              <CardContent className='mt-4 px-6'>
                <ImageSlide images={data.files} enlargeMode />
                <p className={cn(Typography.BODY_3, 'mt-5')}>{data.content}</p>
              </CardContent>
              <CardFooter className='mb-4 mt-6 flex flex-col gap-7'>
                <div className='flex items-center gap-2 px-6'>
                  <IconChat />
                  <p className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
                    댓글 <span>{data.comments.length}</span>
                  </p>
                </div>
                <LogStudentCommentList comments={data.comments} />
              </CardFooter>
            </Card>
          </Layout.Contents>
          <Layout.BottomArea className='p-0'>
            <LogStudentCommentInput />
          </Layout.BottomArea>
        </LogStudentCommentContext.Provider>
      )}
    </Layout>
  );
};

export { StudentLogDetailPage };
