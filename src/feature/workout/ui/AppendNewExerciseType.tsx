'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import {
  IconBack,
  IconDotsVertical,
  IconNotification,
  IconSearch,
} from '@/shared/assets';
import IconNoCircleCheck from '@/shared/assets/images/noCircleCheck.svg';
import { useDebounce } from '@/shared/hooks';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Layout,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';

import { useDeleteExerciseMutation } from '../api/mutations';
import { useWorkoutCategoryListQuery, useWorkoutTypeListQuery } from '../api/queries';
import { ExerciseType } from '../model/types';
import { CreateNewExerciseBottomSheet } from './CreateNewExerciseBottomSheet';

interface Props {
  completedExerciseIds: number[];
  appendExcercise: (newExcerciseType: ExerciseType[]) => void;
  close: () => void;
}

const AppendNewExerciseType = ({
  completedExerciseIds,
  appendExcercise,
  close,
}: Props) => {
  const { errorToast } = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<ExerciseType[]>([]);

  const { data: categories } = useWorkoutCategoryListQuery();
  const {
    data: pagedTypes,
    refetch,
    hasNextPage,
    fetchNextPage,
  } = useWorkoutTypeListQuery({
    searchValue: debouncedSearch,
    exerciseCategory: selectedCategory,
  });
  const { mutate } = useDeleteExerciseMutation();

  const types = pagedTypes?.pages.flatMap((page) => page.content).filter(Boolean);
  const filteredTypes = types
    ?.filter((item) => {
      if (!selectedCategory) return true;
      return item.category === selectedCategory;
    })
    .filter((item) => !completedExerciseIds.includes(item.exerciseId));

  const deleteCustomExercise = (exerciseId: number) => {
    mutate(exerciseId, {
      onSuccess: async () => {
        await refetch();
      },
      onError: (error) => {
        const message = error?.response?.data.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  const submit = () => {
    if (!types || buttonDisabled) return;
    appendExcercise(selectedTypes);
    close();
  };

  const [ref, inView] = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(() => {
        throw new Error('Error fetching next page');
      });
    }
  }, [fetchNextPage, hasNextPage, inView]);

  const buttonDisabled = selectedTypes.length === 0;

  return (
    <Layout className='bg-white'>
      <Layout.Header>
        <Button variant='ghost' size='auto' onClick={close}>
          <IconBack />
        </Button>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
          운동 추가하기
        </h1>
      </Layout.Header>
      <Layout.Contents className='hide-scrollbar px-7'>
        <div className='flex h-fit w-full py-6'>
          <div className='flex h-fit w-full justify-between rounded-md bg-gray-200 px-6 py-4'>
            <Button variant='ghost' size='icon' className='h-7 w-7'>
              <IconSearch />
            </Button>
            <input
              type='text'
              className='w-full bg-transparent px-5 outline-hidden ring-0'
              onChange={(e) => setSearch(e.target.value)}
              placeholder='추가하고 싶은 운동을 검색해보세요'
            />
          </div>
        </div>

        {categories && (
          <div className='hide-scrollbar overflow-x-auto'>
            <div className='mt-2 flex w-[calc(100vw-40px)] flex-nowrap gap-3'>
              {categories.map(({ category, name }) => {
                const selected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    className={cn(
                      Typography.TITLE_3,
                      'whitespace-nowrap rounded-md bg-gray-100 px-8 py-2',
                      selected && 'bg-primary-500 text-white'
                    )}
                    onClick={() => {
                      if (selected) {
                        setSelectedCategory(null);
                      } else {
                        setSelectedCategory(category);
                      }
                    }}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {categories && (
          <div className='py-9'>
            <CreateNewExerciseBottomSheet
              categories={categories}
              defaultSearch={search}
            />
          </div>
        )}
        {!filteredTypes && (
          <div className='flex-center mt-10 w-full'>
            <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
          </div>
        )}
        {filteredTypes && filteredTypes.length === 0 && (
          <div
            className={cn(
              Typography.HEADING_4_SEMIBOLD,
              'flex-center mt-10 flex w-full flex-col gap-5 text-gray-400'
            )}>
            <IconNotification width={33} height={33} stroke='var(--gray-300)' />
            추가 가능한 운동이 없습니다.
          </div>
        )}
        {filteredTypes && filteredTypes.length > 0 && (
          <div>
            <ul className='flex h-fit w-full flex-col'>
              {filteredTypes.map((type) => {
                const selected = selectedTypes.includes(type);
                return (
                  <li key={type.exerciseId}>
                    <label
                      htmlFor={type.names}
                      className={cn(
                        'flex w-full items-center justify-between py-6',
                        selected && 'bg-blue-10'
                      )}>
                      <div className='flex items-center gap-6'>
                        <input
                          id={type.names}
                          type='checkbox'
                          className='peer hidden'
                          checked={selected}
                          onChange={() => {
                            if (!selected) {
                              setSelectedTypes((prev) => [...prev, type]);
                            }
                            if (selected) {
                              setSelectedTypes((prev) =>
                                prev.filter((item) => item.exerciseId !== type.exerciseId)
                              );
                            }
                          }}
                        />
                        <span className='flex h-7 w-7 items-center justify-center rounded-sm border border-solid border-gray-300 peer-checked:border-none peer-checked:bg-primary-500'>
                          <IconNoCircleCheck width={15} height={12} fill='white' />
                        </span>
                        <div className='flex flex-col'>
                          <p className={cn(Typography.TITLE_2)}>{type.names}</p>
                          <span
                            className={cn(Typography.BODY_4_REGULAR, 'text-gray-600')}>
                            {type.muscles}
                          </span>
                        </div>
                      </div>
                      {type.custom && (
                        <Sheet>
                          <SheetTrigger className='flex-center h-6 w-6'>
                            <IconDotsVertical />
                          </SheetTrigger>
                          <SheetContent
                            headerType='thumb'
                            className='flex flex-col px-0 pt-8'>
                            <SheetHeader>
                              <h3
                                className={cn(
                                  Typography.TITLE_1_SEMIBOLD,
                                  'text-center'
                                )}>
                                {type.names}
                              </h3>
                            </SheetHeader>
                            <SheetClose
                              className={cn(
                                Typography.BODY_1,
                                'w-full border-t px-7 py-6 text-left'
                              )}
                              onClick={() => deleteCustomExercise(type.exerciseId)}>
                              목록에서 제거
                            </SheetClose>
                          </SheetContent>
                        </Sheet>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
            {filteredTypes && hasNextPage && (
              <div ref={ref} className='flex-center h-7 w-full p-3'>
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              </div>
            )}
          </div>
        )}
      </Layout.Contents>
      <Layout.BottomArea>
        <Button
          variant='default'
          size='full'
          onClick={submit}
          disabled={buttonDisabled}
          className={cn(Typography.TITLE_1_BOLD)}>
          {buttonDisabled ? '운동 추가하기' : `${selectedTypes.length}개의 운동 추가하기`}
        </Button>
      </Layout.BottomArea>
    </Layout>
  );
};

export { AppendNewExerciseType };
