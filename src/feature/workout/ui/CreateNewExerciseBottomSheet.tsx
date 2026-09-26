'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { IconPlus } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  useToast,
} from '@/shared/ui';
import { cn, twSelector } from '@/shared/utils';

import { useCreateExerciseMutation } from '../api/mutations';
import { workoutKeys } from '../api/queries';
import { WorkoutCategory } from '../model/types';

const CreateNewExerciseBottomSheet = ({
  categories,
  defaultSearch,
}: {
  categories: WorkoutCategory[];
  defaultSearch: string;
}) => {
  const queryClient = useQueryClient();
  const { errorToast } = useToast();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const [muscles, setMuscles] = useState('');
  const { mutate, isPending } = useCreateExerciseMutation();

  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (isPending) return;
    if (buttonDisabled) return;

    mutate(
      {
        category: selectedCategory,
        names: name,
        muscles,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: workoutKeys.typeList(),
          });
          setOpen(false);
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  const reset = () => {
    setName('');
    setCategory(null);
    setMuscles('');
  };

  const buttonDisabled = !name || !selectedCategory;

  useEffect(() => {
    if (open && defaultSearch) {
      setName(defaultSearch);
    }

    if (open) {
      setTimeout(() => {
        inputRef.current?.blur();
      }, 0);
    }
  }, [defaultSearch, open]);

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        setOpen(state);
        reset();
      }}>
      <SheetTrigger asChild>
        <Button
          variant='outline'
          size='full'
          className='flex gap-2 border-gray-200 bg-transparent py-3'>
          신규 운동 추가
          <IconPlus width={14} height={14} />
        </Button>
      </SheetTrigger>
      <SheetContent headerType='thumb' className='flex flex-col gap-9 px-0 pt-8'>
        <SheetHeader className='border-b py-5'>
          <h3 className={cn(Typography.TITLE_1_SEMIBOLD, 'text-center')}>
            신규 운동 추가
          </h3>
        </SheetHeader>
        <div className='flex flex-col gap-7 px-7 text-black'>
          <div className='flex flex-col gap-3'>
            <p className={cn(Typography.TITLE_3)}>
              운동 이름 <span className='text-point'>*</span>
            </p>
            <div className='rounded-md border border-gray-200 px-6 py-[13px]'>
              <Input
                ref={inputRef}
                type='text'
                placeholder='추가할 운동 이름을 입력해주세요.'
                value={name}
                className={cn(
                  'w-full',
                  twSelector('placeholder', cn(Typography.BODY_1, 'text-gray-500'))
                )}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-col gap-3'>
            <p className={cn(Typography.TITLE_3)}>
              카테고리 <span className='text-point'>*</span>
            </p>
            <div className='hide-scrollbar overflow-x-auto'>
              <div className='flex w-full flex-nowrap gap-3'>
                {categories.map(({ category, name }) => {
                  const selected = category === selectedCategory;
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
                          setCategory(null);
                        } else {
                          setCategory(category);
                        }
                      }}>
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-3'>
            <p className={cn(Typography.TITLE_3)}>사용 근육</p>
            <div className='rounded-md border border-gray-200 px-6 py-[13px]'>
              <Input
                type='text'
                placeholder='사용 근육을 입력해주세요.'
                value={muscles}
                className={cn(
                  'w-full',
                  twSelector('placeholder', cn(Typography.BODY_1, 'text-gray-500'))
                )}
                onChange={(e) => setMuscles(e.target.value)}
              />
            </div>
          </div>
        </div>
        <SheetFooter className='px-7'>
          <Button
            variant='default'
            size='full'
            onClick={submit}
            disabled={buttonDisabled}
            className={cn(Typography.TITLE_1_BOLD)}>
            운동 추가하기
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export { CreateNewExerciseBottomSheet };
