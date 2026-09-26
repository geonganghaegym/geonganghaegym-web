'use client';

import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { ComponentProps } from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/shared/ui/button';
import { cn } from '@/shared/utils/tw-utils';

import { Typography } from '../mixin';

export type CalendarProps = ComponentProps<typeof DayPicker>;

type isToggleProps = CalendarProps & {
  isToggle?: boolean;
};
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  isToggle,
  ...props
}: isToggleProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('relative', className)}
      classNames={{
        months: 'flex flex-col space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-between pt-1 relative items-center',
        caption_label: Typography.HEADING_4_BOLD,
        nav: 'absolute inset-x-0 top-1 z-10 flex items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'w-[30px] h-[30px] bg-transparent p-0 opacity-100 hover:opacity-100 disabled:bg-transparent'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'w-[30px] h-[30px] bg-transparent p-0 opacity-100 hover:opacity-100 disabled:bg-transparent'
        ),
        month_grid: 'w-full border-collapse space-y-1 h-[200px]',
        weekdays: 'flex justify-between items-center',
        weekday: cn(
          Typography.BODY_2,
          'w-[40px] h-[40px] flex justify-center items-center text-muted-foreground rounded-md font-normal'
        ),
        week: 'flex w-full justify-between items-center',
        day: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          Typography.TITLE_1_SEMIBOLD,
          'rdp-day_button w-[40px] h-[40px] p-0 rounded-full'
        ),
        // v8은 상태 클래스를 버튼에, v10은 셀(td)에 붙인다. v8 화면과 같게 버튼 스타일은 [&>button]으로 건다.
        selected:
          'bg-primary-500 text-white rounded-[50%] [&>button]:bg-primary [&>button]:text-white',
        today: '[&>button]:bg-primary [&>button]:text-accent-foreground',
        outside:
          'day-outside [&>button]:text-muted-foreground [&>button]:opacity-50 aria-selected:[&>button]:text-muted-foreground aria-selected:[&>button]:opacity-30',
        disabled:
          '[&>button]:text-muted-foreground [&>button]:opacity-50 [&>button]:disabled:bg-transparent',
        range_middle:
          'aria-selected:[&>button]:bg-primary aria-selected:[&>button]:text-accent-foreground',
        range_end: 'day-range-end',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }: { orientation?: string }) =>
          orientation === 'left' ? (
            <ChevronLeft className={cn(isToggle && 'hidden', 'h-[30px] w-[30px]')} />
          ) : (
            <ChevronRight className={cn(isToggle && 'hidden', 'h-[30px] w-[30px]')} />
          ),
      }}
      locale={ko}
      weekStartsOn={0}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
