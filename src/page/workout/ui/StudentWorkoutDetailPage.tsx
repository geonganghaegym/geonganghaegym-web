'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

import {
  ExerciseDetail,
  PostMetrics,
  useDeleteWorkoutMutation,
  useWorkoutComment,
  useWorkoutDetailQuery,
  WorkoutCommentContext,
  WorkoutCommentInput,
  WorkoutCommentsWrapper,
} from '@/feature/workout';
import { workoutKeys } from '@/feature/workout/api/queries';
import {
  IconBack,
  IconDotsVertical,
  IconEdit,
  IconGroup,
  IconLock,
  IconTrash,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { ImageSlide, Layout } from '@/widget';

interface Props {
  workoutHistoryId: number;
}

const StudentWorkoutDetailPage = ({ workoutHistoryId }: Props) => {
  const { errorToast } = useToast();

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data } = useWorkoutDetailQuery(workoutHistoryId);
  const { mutate } = useDeleteWorkoutMutation();

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const value = useWorkoutComment({ workoutHistoryId, ref: inputRef });

  const formattedDate = dayjs(data?.createdAt).format('M월 D일 (ddd)');

  const deleteWorkout = () => {
    mutate(workoutHistoryId, {
      onSuccess: async () => {
        await queryClient.refetchQueries({
          queryKey: workoutKeys.list(),
        });
        await queryClient.refetchQueries({
          queryKey: workoutKeys.community(),
        });
        queryClient.removeQueries({
          queryKey: workoutKeys.detail(workoutHistoryId),
        });
        router.replace('/student/workout');
      },
      onError: (error) => {
        const message = error?.response?.data.message;
        errorToast(message);
      },
    });
  };

  return (
    <WorkoutCommentContext.Provider value={value}>
      <Layout>
        <Layout.Header>
          <button onClick={() => router.back()}>
            <IconBack />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className={Typography.TITLE_1_SEMIBOLD}>
                <IconDotsVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='absolute -right-5 top-0 flex w-[120px] flex-col bg-white'>
              <DropdownMenuGroup className='flex flex-col'>
                <DropdownMenuItem
                  className={cn(Typography.TITLE_3, 'flex items-center gap-3 px-6 py-5')}
                  onClick={() =>
                    router.push(`/student/workout/${workoutHistoryId}/edit`)
                  }>
                  <IconEdit />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    Typography.TITLE_3,
                    'flex items-center gap-3 px-6 py-5 text-point'
                  )}
                  onClick={deleteWorkout}>
                  <IconTrash />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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

export { StudentWorkoutDetailPage };
