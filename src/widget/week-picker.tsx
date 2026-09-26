'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Modifiers } from 'react-day-picker';

import { IconArrowLeft, IconArrowRight, IconClose } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Button,
  Calendar,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui';
import { cn, getStartOfWeek } from '@/shared/utils';
dayjs.locale('ko');

const DailyCalendar = ({
  defaultStartDate,
  changeWeek,
}: {
  defaultStartDate: Date;
  changeWeek: (date: Date) => void;
}) => {
  const [startOfWeek, setStartOfWeek] = useState<Date>(defaultStartDate);
  const [month, setMonth] = useState<Date>(defaultStartDate);

  const onDayClick = (day: Date, modifiers: Modifiers) => {
    if (modifiers.outside) {
      setMonth(day);
    }
    const newStartOfWeek = getStartOfWeek(day);
    setStartOfWeek(newStartOfWeek);
  };

  const handleMonthChange = (month: Date) => {
    setMonth(month);
  };

  const selectWeek = () => {
    changeWeek(startOfWeek);
  };

  const buttonText = `${dayjs(startOfWeek).format('M월DD일')} ~ ${dayjs(startOfWeek).add(6, 'days').format('M월DD일')}`;

  return (
    <>
      <div className='flex justify-between'>
        <h4 className={Typography.TITLE_1_SEMIBOLD}>날짜 선택하기</h4>
        <Dialog.Close>
          <IconClose width={20} height={20} />
        </Dialog.Close>
      </div>
      <div>
        <Calendar
          classNames={{
            range_start: 'day-range-start rounded-l-full',
            range_middle: 'aria-selected:[&>button]:text-black',
            range_end: 'day-range-end rounded-r-full',
            selected: 'bg-blue-50 [&>button]:bg-primary [&>button]:text-white',
            // v8에서는 셀 클래스를 덮어써 p-0이 빠져 td 브라우저 기본 padding(1px)이 남았다(행 높이 42px).
            // Tailwind 4 preflight는 모든 요소 padding을 0으로 만들므로 1px을 명시한다.
            day: 'text-center text-sm relative w-full p-px focus-within:relative focus-within:z-20',
            month_caption: 'relative flex h-[34px] items-center justify-between pt-1',
            nav: 'absolute right-0 top-1 z-10 flex h-[30px] w-[80px] items-center justify-between px-1',
            button_previous:
              'inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-transparent bg-transparent p-0',
            button_next:
              'inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-transparent bg-transparent p-0',
          }}
          formatters={{
            formatCaption: (date) =>
              `${dayjs(date).format('YYYY')}년 ${dayjs(date).format('MMMM')}`,
          }}
          mode='range'
          selected={{
            from: dayjs(startOfWeek).toDate(),
            to: dayjs(startOfWeek).add(6, 'days').toDate(),
          }}
          onDayClick={onDayClick}
          month={month}
          onMonthChange={handleMonthChange}
        />
      </div>
      <DialogClose asChild>
        <Button size='full' className={cn(Typography.TITLE_1_BOLD)} onClick={selectWeek}>
          {buttonText}
        </Button>
      </DialogClose>
    </>
  );
};

interface WeekPickerProps {
  startDate: Date;
  onWeekChange: (date: Date) => void;
}

const WeekPicker = ({ startDate, onWeekChange }: WeekPickerProps) => {
  const endDate = dayjs(startDate).add(6, 'day');

  const changeWeek = (date: Date) => {
    onWeekChange(date);
  };

  const movePrevWeek = () => {
    changeWeek(dayjs(startDate).subtract(7, 'day').toDate());
  };

  const moveNextWeek = () => {
    changeWeek(dayjs(startDate).add(7, 'day').toDate());
  };

  return (
    <div className='mx-7 flex items-center justify-between rounded-md border border-gray-300 px-6 py-4'>
      <Button variant='ghost' size='auto' onClick={movePrevWeek}>
        <IconArrowLeft stroke={'var(--gray-600)'} />
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <p className={cn(Typography.BODY_1)}>
            {dayjs(startDate).format('YY.MM.DD')}-{endDate.format('MM.DD')}
          </p>
        </DialogTrigger>
        <DialogContent
          className={cn(
            'rounded-t-5 top-auto bottom-0 flex max-w-(--max-width) translate-y-0 flex-col justify-center space-y-8 px-7 py-10',
            'data-[state=closed]:slide-out-to-bottom-[200%] data-[state=open]:slide-in-from-bottom-[200%]'
          )}>
          <DailyCalendar defaultStartDate={startDate} changeWeek={changeWeek} />
        </DialogContent>
      </Dialog>
      <Button variant='ghost' size='auto' onClick={moveNextWeek}>
        <IconArrowRight stroke={'var(--gray-600)'} />
      </Button>
    </div>
  );
};

export { WeekPicker };
