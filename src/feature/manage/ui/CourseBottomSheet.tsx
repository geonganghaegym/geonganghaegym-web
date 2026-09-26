'use client';

import {
  Dispatch,
  FormEvent,
  HTMLAttributes,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import { Typography } from '@/shared/mixin';
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui';
import { cn } from '@/shared/utils';

interface CourseSheetFooterProps {
  children: ReactNode;
  courseInput: string;
  clickButtonHandler: () => void;
}

export const CourseSheetFooter = ({
  children,
  courseInput,
  clickButtonHandler,
}: CourseSheetFooterProps) => {
  return (
    <SheetFooter>
      <Button
        className={cn('h-[52px] w-full', Typography.TITLE_1)}
        disabled={courseInput === '' || Number(courseInput) > 500}
        onClick={clickButtonHandler}>
        {children}
      </Button>
    </SheetFooter>
  );
};

interface CourseSheetHeaderProps {
  children?: ReactNode;
}

export const CourseSheetHeader = ({ children }: CourseSheetHeaderProps) => {
  return (
    <SheetHeader>
      <SheetTitle className={cn('mb-8 text-left text-black', Typography.HEADING_4)}>
        {children}
      </SheetTitle>
    </SheetHeader>
  );
};

interface CourseSheetInputProps {
  isOpen?: boolean;
  courseInput: string;
  setCourseInput: Dispatch<SetStateAction<string>>;
}

export const CourseSheetInput = ({
  isOpen,
  courseInput,
  setCourseInput,
}: CourseSheetInputProps) => {
  const [courseInputError, setCourseInputError] = useState('');

  const changeCourseInput = (e: FormEvent<HTMLInputElement>) => {
    let inputValue = e.currentTarget.value;
    if (inputValue.length > 3) {
      inputValue = inputValue.slice(0, 3);
    }

    if (Number(inputValue) > 500) {
      setCourseInputError('500회 이하로 입력해주세요.');
    } else {
      setCourseInputError('');
    }
    setCourseInput(inputValue);
  };

  useEffect(() => {
    if (!isOpen) {
      setCourseInput('');
      setCourseInputError('');
    }
  }, [isOpen]);

  return (
    <div className='mb-8 text-center'>
      <Input
        type='number'
        value={courseInput}
        onChange={changeCourseInput}
        className={cn(
          'border-b w-[100px] border-b border-solid border-y-gray-400 py-[2px] text-center text-[40px] font-bold leading-[130%] text-black focus:border-y-primary-500',
          courseInputError && 'focus:border-y-red-500'
        )}
      />
      {courseInputError && (
        <p className={cn('mt-3 text-point', Typography.BODY_4)}>{courseInputError}</p>
      )}
    </div>
  );
};

interface CourseSheetContentProps {
  children: ReactNode;
}

export const CourseSheetContent = ({ children }: CourseSheetContentProps) => {
  return (
    <SheetContent
      className='m-auto mb-7 w-[calc(100%-20px)] rounded-lg px-7 pb-9 pt-8'
      side='bottom'>
      {children}
    </SheetContent>
  );
};

interface CourseSheetTriggerProps {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}

export const CourseSheetTrigger = ({
  className,
  children,
  disabled = false,
}: CourseSheetTriggerProps) => {
  return (
    <SheetTrigger
      className={cn(Typography.HEADING_5, className, disabled && 'text-gray-400')}
      disabled={disabled}>
      {children}
    </SheetTrigger>
  );
};

interface CourseSheetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const CourseSheet = ({ children, isOpen, setIsOpen }: CourseSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {children}
    </Sheet>
  );
};
