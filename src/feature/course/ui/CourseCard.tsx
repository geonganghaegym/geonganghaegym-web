'use client';

import { HTMLAttributes, ReactNode } from 'react';

import { Typography } from '@/shared/mixin';
import { cn } from '@/shared/utils';

import { Card, CardContent, CardHeader } from '../../../shared/ui/card';
import { Progress } from '../../../shared/ui/progress';

interface CourseCardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  expiration?: boolean;
  children: ReactNode;
}

export const CourseCard = ({ className, children, expiration }: CourseCardProps) => {
  return (
    <Card
      className={cn(
        expiration ? 'bg-gray-500' : 'bg-primary-500',
        'w-full gap-y-0 p-0 text-white',
        className
      )}>
      {children}
    </Card>
  );
};

interface CourseCardHeaderProps {
  gymName: string;
  totalLessonCnt: number;
  remainLessonCnt: number;
  completedLessonCnt: number;
}

export const CourseCardHeader = ({
  gymName,
  totalLessonCnt,
  remainLessonCnt,
  completedLessonCnt,
}: CourseCardHeaderProps) => {
  const expirationStatus =
    totalLessonCnt === completedLessonCnt
      ? `${totalLessonCnt}회 PT 수강 만료`
      : `${remainLessonCnt}회 예약할 수 있어요!`;
  return (
    <CardHeader className='px-6 pb-8 pt-7'>
      <div
        className={cn(
          Typography.BODY_3,
          'mb-1 flex items-center justify-between text-white'
        )}>
        <p className={cn(Typography.BODY_3, 'text-gray-100')}>{gymName}</p>
        <span className={cn(Typography.BODY_3, 'text-gray-100')}>
          {`PT ${totalLessonCnt}회 수강권`}
        </span>
      </div>
      <p className={cn(Typography.HEADING_3, 'text-white')}>{expirationStatus}</p>
    </CardHeader>
  );
};

interface CourseCardContentProps {
  totalLessonCnt: number;
  completedLessonCnt: number;
  className?: string;
  progressClassName?: string;
}

export const CourseCardContent = ({
  totalLessonCnt,
  completedLessonCnt,
  className,
  progressClassName,
}: CourseCardContentProps) => {
  // 수강권 횟수보다 진행 횟수가 많은 데이터가 있어 막대가 넘치지 않게 100에서 자른다
  const progress = Math.min((completedLessonCnt / totalLessonCnt) * 100, 100);
  const expirationTextColor =
    completedLessonCnt === totalLessonCnt ? 'text-gray-300' : 'text-[#8EC7FF]';
  return (
    <CardContent>
      <div className='px-6 pb-7'>
        <p className={cn(Typography.HEADING_5, 'mb-2 text-white')}>
          PT 진행 횟수 {completedLessonCnt}
          <span className={cn(expirationTextColor, Typography.BODY_3, className)}>
            /{totalLessonCnt}
          </span>
        </p>
        <Progress
          className='h-[2px]'
          progressClassName={progressClassName}
          value={progress}
        />
      </div>
    </CardContent>
  );
};
