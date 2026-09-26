'use client';

import 'dayjs/locale/ko';

import dayjs from 'dayjs';
dayjs.locale('ko');

import Link from 'next/link';
import { useRef } from 'react';

import {
  ExerciseDetail,
  PostMetrics,
  useWorkoutComment,
  useWorkoutDetailQuery,
  WorkoutCommentContext,
  WorkoutCommentInput,
  WorkoutCommentsWrapper,
} from '@/feature/workout';
import { IconBack, IconGroup, IconLock } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { ImageSlide, Layout } from '@/widget';

interface Props {
  workoutHistoryId: number;
  memberId: number;
}

const TrainerWorkoutDetailPage = ({ workoutHistoryId, memberId }: Props) => {
  const { data } = useWorkoutDetailQuery(workoutHistoryId);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const value = useWorkoutComment({ workoutHistoryId, ref: inputRef });

  const formattedDate = dayjs(data?.createdAt).format('M월 D일 (ddd)');

  return (
    <WorkoutCommentContext.Provider value={value}>
      <Layout>
        <Layout.Header>
          <Link href={`/trainer/manage/${memberId}/workout`}>
            <IconBack />
          </Link>
        </Layout.Header>
        <Layout.Contents className='hide-scrollbar px-7 py-6'>
          {data && (
            <Card className='w-full gap-0 px-0 pb-0 pt-7'>
              <CardHeader className='flex w-full items-center justify-between px-6'>
                <p className={cn(Typography.TITLE_3, 'mb-4')}>{formattedDate}</p>
                {data.viewMySelf ? <IconLock /> : <IconGroup />}
              </CardHeader>
              <CardContent className='mt-4 px-6 pb-7'>
                <p className={cn(Typography.BODY_3, 'mb-5 mt-4')}>{data.content}</p>
                <ImageSlide images={data.files} enlargeMode />
                <ExerciseDetail exercises={data.completedExercises} />
                <PostMetrics
                  workoutHistoryId={workoutHistoryId}
                  liked={data.liked}
                  likeCnt={data.likeCnt}
                  commentCnt={data.commentCnt}
                />
              </CardContent>
              <WorkoutCommentsWrapper />
            </Card>
          )}
        </Layout.Contents>
        <WorkoutCommentInput />
      </Layout>
    </WorkoutCommentContext.Provider>
  );
};

export { TrainerWorkoutDetailPage };
