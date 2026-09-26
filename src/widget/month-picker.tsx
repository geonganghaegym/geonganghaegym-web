'use client';

import dayjs from 'dayjs';
dayjs.locale('ko');

import { PropsWithChildren, useState } from 'react';

import { IconArrowLeft, IconArrowRight, IconTriangleDown } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, Sheet, SheetClose, SheetContent, SheetTrigger } from '@/shared/ui';
import { cn } from '@/shared/utils';

interface Props {
  date?: Date;
  onChangeDate: (date: Date) => void;
  className?: string;
}

const MonthlyCalendar = ({ date, onChangeDate }: Props) => {
  const currentYear = dayjs().format('YYYY');
  const currentMonth = dayjs().format('MM');

  const [year, setYear] = useState(dayjs(date).format('YYYY') ?? currentYear);
  const [month, setMonth] = useState(dayjs(date).format('M') ?? currentMonth);

  const selectDate = () => {
    const newDate = dayjs(year + month, 'YYYYM').toDate();
    onChangeDate(newDate);
  };

  const unselectabled = year >= currentYear;

  return (
    <>
      <h4 className={Typography.TITLE_1_SEMIBOLD}>월 선택하기</h4>
      <div className='flex justify-between'>
        <p className={cn(Typography.HEADING_4_BOLD)}>{year}년</p>
        <div className='flex space-x-8'>
          <Button
            variant='ghost'
            size='auto'
            onClick={() => {
              setYear((prev) => String(Number(prev) - 1));
            }}>
            <IconArrowLeft stroke={cn('var(--primary-500)')} />
          </Button>
          <Button
            variant='ghost'
            size='auto'
            disabled={unselectabled}
            className='disabled:bg-transparent'
            onClick={() => {
              if (unselectabled) return;
              setYear((prev) => String(Number(prev) + 1));
            }}>
            <IconArrowRight
              stroke={cn(unselectabled ? 'var(--gray-500)' : 'var(--primary-500)')}
            />
          </Button>
        </div>
      </div>
      <div className='flex flex-wrap'>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((item) => {
          const isCurrent = year === currentYear && item === Number(currentMonth);
          const isFuture = year === currentYear && item > Number(currentMonth);
          return (
            <div key={item} className='flex h-[72px] w-1/4 items-center justify-center'>
              <span
                className={cn(
                  Typography.TITLE_1_SEMIBOLD,
                  'flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full',
                  isCurrent && 'text-primary-500',
                  month === String(item) && 'bg-primary-500 text-white',
                  isFuture && 'text-gray-500'
                )}
                onClick={() => {
                  if (isFuture) return;
                  setMonth(String(item));
                }}>
                {item}월
              </span>
            </div>
          );
        })}
      </div>
      <SheetClose asChild>
        <Button size='full' className={Typography.TITLE_1_BOLD} onClick={selectDate}>
          {year}년 {month}월 선택
        </Button>
      </SheetClose>
    </>
  );
};

/**
 * @description MonthlyCalendar에 Sheet를 감싸주는 컴포넌트
 */
const MonthPicker = ({
  date,
  onChangeDate,
  className,
  children,
}: PropsWithChildren<Props>) => {
  const currentDate = Date.now();
  const selectedDate = dayjs(date ?? currentDate).format('YYYY년 M월');

  return (
    <div className={cn(className)}>
      <Sheet>
        <SheetTrigger>
          {children ?? (
            <div className='flex items-center space-x-1 py-6'>
              <p className={Typography.HEADING_5}>{selectedDate}</p>
              <IconTriangleDown />
            </div>
          )}
        </SheetTrigger>
        <SheetContent
          side='bottom'
          className={cn('mx-auto flex max-w-(--max-width) flex-col gap-7')}>
          <MonthlyCalendar date={date} onChangeDate={onChangeDate} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export { MonthlyCalendar, MonthPicker };
