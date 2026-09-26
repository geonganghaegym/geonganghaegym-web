'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createRef, RefObject, useEffect, useRef, useState } from 'react';

import { useImages } from '@/entity/image';
import {
  AppendNewExerciseType,
  ComplexExercise,
  ExerciseType,
  useEditWorkoutMutation,
  useWorkoutDetailQuery,
  useWorkoutTypeListQuery,
} from '@/feature/workout';
import { workoutKeys } from '@/feature/workout/api/queries';
import {
  IconCamera,
  IconClose,
  IconCloseBlack,
  IconDelete,
  IconPlus,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, Input, Switch, Textarea, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const EditWorkoutPage = ({ workoutHistoryId }: { workoutHistoryId: number }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { errorToast } = useToast();
  const { images, uploadFiles, updateImages } = useImages();

  const { data, refetch } = useWorkoutDetailQuery(workoutHistoryId);
  const { data: pagedTypes } = useWorkoutTypeListQuery();
  const types = pagedTypes?.pages.flatMap((page) => page.content).filter(Boolean);

  const { mutate } = useEditWorkoutMutation();

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [viewMySelf, setViewMySelf] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<ComplexExercise[]>([]);

  const setNumRef = useRef<RefObject<HTMLInputElement | null>[]>([]);
  const numberOfCyclesRef = useRef<RefObject<HTMLInputElement | null>[]>([]);
  const weightRef = useRef<RefObject<HTMLInputElement | null>[]>([]);

  const appendExcercise = (newExcerciseTypes: ExerciseType[]) => {
    const newExcercises = newExcerciseTypes.map((item) => {
      setNumRef.current.push(createRef<HTMLInputElement>());
      numberOfCyclesRef.current.push(createRef<HTMLInputElement>());
      weightRef.current.push(createRef<HTMLInputElement>());
      return {
        ...item,
        setNum: 0,
        weight: 0,
        numberOfCycles: 0,
      };
    });
    setCompletedExercises((prev) => [...prev, ...newExcercises]);
  };

  const deleteExcercise = (exerciseId: number) => {
    setCompletedExercises((prev) =>
      prev.filter((item) => item.exerciseId !== exerciseId)
    );
  };

  const submit = () => {
    mutate(
      {
        files: images,
        content,
        viewMySelf,
        completedExercises,
        workoutHistoryId,
      },
      {
        onSuccess: async () => {
          await refetch();
          await queryClient.refetchQueries({
            queryKey: workoutKeys.list(),
          });
          await queryClient.refetchQueries({
            queryKey: workoutKeys.community(),
          });
          router.replace('/student/workout');
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  const buttonDisabled = completedExercises.length === 0;

  useEffect(() => {
    if (data && types) {
      const { files, content, viewMySelf, completedExercises } = data;
      updateImages(files);
      setContent(content);
      setViewMySelf(viewMySelf);
      setCompletedExercises(
        completedExercises.map((item) => {
          const type = types.find((type) => type.exerciseId === item.exerciseId);
          setNumRef.current.push(createRef<HTMLInputElement>());
          numberOfCyclesRef.current.push(createRef<HTMLInputElement>());
          weightRef.current.push(createRef<HTMLInputElement>());
          return {
            ...item,
            category: type?.category ?? '',
            names: item.name,
            muscles: type?.muscles ?? '',
            custom: type?.custom ?? true,
          };
        })
      );
    }
  }, [pagedTypes]);

  if (open) {
    return (
      <AppendNewExerciseType
        completedExerciseIds={completedExercises.map((item) => item.exerciseId)}
        appendExcercise={appendExcercise}
        close={() => setOpen(false)}
      />
    );
  }

  return (
    <Layout className='bg-white'>
      <Layout.Header>
        <Button variant='ghost' className='p-0' onClick={() => router.back()}>
          <IconClose />
        </Button>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          운동 기록 작성
        </h1>
      </Layout.Header>
      <Layout.Contents className='hide-scrollbar p-7 pb-10'>
        <div className='flex gap-3'>
          <div>
            <Input
              id='image-input'
              type='file'
              multiple
              accept='image/*'
              className='hidden'
              onChange={uploadFiles}
            />
            <label
              htmlFor='image-input'
              className={cn(
                'flex-center h-[60px] w-[60px] cursor-pointer flex-col gap-1 rounded-sm border border-gray-200'
              )}>
              <IconCamera />
              <span className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
                {images.length} / 3
              </span>
            </label>
          </div>
          {images.map((image, index) => (
            <div key={index} className='relative'>
              <Image
                src={`${image.fileUrl}?w=800&q=90`}
                width={300}
                height={300}
                alt='staged image'
                className='h-[60px] w-[60px] rounded-sm object-cover'
                priority
              />
              <button
                className='absolute -right-2 -top-2 z-10'
                onClick={() => updateImages(images.filter((_, idx) => index !== idx))}>
                <IconCloseBlack width={20} height={20} />
              </button>
            </div>
          ))}
        </div>
        <div className='mt-10 flex flex-col gap-3'>
          <h3 className={cn(Typography.TITLE_3)}>메모</h3>
          <Textarea
            placeholder='메모나 문구를 작성해주세요.'
            className={cn(
              Typography.BODY_2,
              'h-[116px] resize-none rounded-lg border border-gray-200 bg-transparent p-6 placeholder:text-gray-500'
            )}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className='mt-10 flex flex-col gap-3'>
          <h3 className={cn(Typography.TITLE_3)}>운동 종류</h3>
          <Button
            variant='outline'
            size='full'
            className='flex gap-2 border-gray-200 bg-transparent py-3'
            onClick={() => setOpen(true)}>
            운동 추가
            <IconPlus width={14} height={14} />
          </Button>
          {completedExercises.length > 0 &&
            completedExercises.map((completedExcercise, index) => (
              <div
                key={completedExcercise.exerciseId}
                className='flex w-full flex-col gap-7 rounded-lg border border-gray-200 px-6 py-7'>
                <div className='flex justify-between'>
                  <h4 className={cn(Typography.TITLE_1_BOLD)}>
                    {completedExcercise.names}
                  </h4>
                  <Button
                    variant='ghost'
                    size='auto'
                    onClick={() => deleteExcercise(completedExcercise.exerciseId)}>
                    <IconDelete width={20} height={20} />
                  </Button>
                </div>
                <div className='grid grid-cols-3 flex-row gap-3'>
                  <div className='flex w-full flex-col items-center justify-between gap-2'>
                    <span className={cn(Typography.TITLE_3, 'text-gray-600')}>세트</span>
                    <div
                      className={cn(
                        'w-full rounded-sm border border-gray-100 bg-gray-100 p-1',
                        'focus-within:border focus-within:border-primary focus-within:bg-white'
                      )}
                      onClick={() => {
                        setNumRef.current[index].current?.focus();
                        setNumRef.current[index].current?.setSelectionRange(
                          String(completedExcercise.setNum).length,
                          String(completedExcercise.setNum).length
                        );
                      }}>
                      <input
                        ref={setNumRef.current[index]}
                        type='text'
                        value={completedExcercise.setNum}
                        pattern='[0-9]*'
                        inputMode='numeric'
                        className={cn(
                          Typography.TITLE_1_BOLD,
                          'w-full bg-transparent text-center outline-hidden ring-0'
                        )}
                        onChange={(e) => {
                          const value =
                            e.target.value.replace(/\D/g, '').replace(/^0+(?!$)/, '') ||
                            '0';
                          if (value.length > 4) return;
                          setCompletedExercises((prev) =>
                            prev.map((item) => {
                              if (completedExcercise.exerciseId === item.exerciseId) {
                                return {
                                  ...item,
                                  setNum: parseInt(value),
                                };
                              }
                              return item;
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className='flex w-full flex-col items-center justify-between gap-2'>
                    <span className={cn(Typography.TITLE_3, 'text-gray-600')}>회</span>
                    <div
                      className={cn(
                        'w-full rounded-sm border border-gray-100 bg-gray-100 p-1',
                        'focus-within:border focus-within:border-primary focus-within:bg-white'
                      )}
                      onClick={() => {
                        numberOfCyclesRef.current[index].current?.focus();
                        numberOfCyclesRef.current[index].current?.setSelectionRange(
                          String(completedExcercise.numberOfCycles).length,
                          String(completedExcercise.numberOfCycles).length
                        );
                      }}>
                      <input
                        ref={numberOfCyclesRef.current[index]}
                        type='text'
                        value={completedExcercise.numberOfCycles}
                        pattern='[0-9]*'
                        inputMode='numeric'
                        className={cn(
                          Typography.TITLE_1_BOLD,
                          'w-full bg-transparent text-center outline-hidden ring-0'
                        )}
                        onChange={(e) => {
                          const value =
                            e.target.value.replace(/\D/g, '').replace(/^0+(?!$)/, '') ||
                            '0';
                          if (value.length > 4) return;
                          setCompletedExercises((prev) =>
                            prev.map((item) => {
                              if (completedExcercise.exerciseId === item.exerciseId) {
                                return {
                                  ...item,
                                  numberOfCycles: parseInt(value),
                                };
                              }
                              return item;
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className='flex w-full flex-col items-center justify-between gap-2'>
                    <span className={cn(Typography.TITLE_3, 'text-gray-600')}>KG</span>

                    <div
                      className={cn(
                        'w-full rounded-sm border border-gray-100 bg-gray-100 p-1',
                        'focus-within:border focus-within:border-primary focus-within:bg-white'
                      )}
                      onClick={() => {
                        weightRef.current[index].current?.focus();
                        weightRef.current[index].current?.setSelectionRange(
                          String(completedExcercise.weight).length,
                          String(completedExcercise.weight).length
                        );
                      }}>
                      <input
                        ref={weightRef.current[index]}
                        type='text'
                        value={completedExcercise.weight}
                        pattern='[0-9]*'
                        inputMode='numeric'
                        className={cn(
                          Typography.TITLE_1_BOLD,
                          'w-full bg-transparent text-center outline-hidden ring-0'
                        )}
                        onChange={(e) => {
                          const value =
                            e.target.value.replace(/\D/g, '').replace(/^0+(?!$)/, '') ||
                            '0';
                          if (value.length > 4) return;
                          setCompletedExercises((prev) =>
                            prev.map((item) => {
                              if (completedExcercise.exerciseId === item.exerciseId) {
                                return { ...item, weight: parseInt(value) };
                              }
                              return item;
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className='mt-10 flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <h3 className={cn(Typography.TITLE_3)}>커뮤니티 공개</h3>
            <p className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
              건강해짐 헬스장 회원들과 공유합니다.
            </p>
          </div>
          <Switch
            id='COMMUNITY'
            checked={!viewMySelf}
            onCheckedChange={(checked) => setViewMySelf(!checked)}
            className='h-fit'
          />
        </div>
      </Layout.Contents>
      <Layout.BottomArea>
        <Button variant='default' size='full' onClick={submit} disabled={buttonDisabled}>
          작성 완료
        </Button>
      </Layout.BottomArea>
    </Layout>
  );
};

export { EditWorkoutPage };
