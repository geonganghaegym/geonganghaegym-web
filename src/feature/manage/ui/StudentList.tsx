'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

import { AddStudentDialog, RegisteredStudent } from '@/feature/manage';
import {
  IconAlertCircle,
  IconPlus,
  IconProfileDefault,
  IconSearch,
} from '@/shared/assets';
import IconArrowDownUp from '@/shared/assets/images/icon_arrow_down_up.svg';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn, twSelector } from '@/shared/utils';

import { useRegisteredStudentsQuery } from '../api/queries';
import { profileBorderStyleMapper } from '../utils';

interface SortCondition<T> {
  label: string;
  condition: (a: T, b: T) => number;
}

const sortConditionMapper: Record<string, SortCondition<RegisteredStudent>> = {
  DEFAULT: {
    label: '기본 순',
    condition: (a, b) => a.memberId - b.memberId,
  },
  RANKING: {
    label: '랭킹 순',
    condition: (a, b) => a.ranking - b.ranking,
  },
};

const StudentListController = (students: RegisteredStudent[]) => ({
  search: (keyword: string) => {
    const searchedStudents = students.filter((student) =>
      student.name.includes(keyword.toLowerCase())
    );
    return StudentListController(searchedStudents);
  },
  sort: (condition: ((a: RegisteredStudent, b: RegisteredStudent) => number) | null) => {
    if (condition === null) return StudentListController(students);
    const sortedStudents = [...students].sort(condition);
    return StudentListController(sortedStudents);
  },
  get: () => students,
});

const StudentList = ({ callback }: { callback?: (memberId: number) => void }) => {
  const router = useRouter();
  const [sort, setSort] = useState(sortConditionMapper.DEFAULT);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: studentList, isLoading } = useRegisteredStudentsQuery();

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const processedStudentList = StudentListController(studentList ?? [])
    .sort(sort.condition)
    .search(searchQuery)
    .get();

  const studentsCount = processedStudentList.length ?? 0;

  const onClickStudent = (memberId: number) => {
    if (callback) {
      return callback(memberId);
    }
    router.push(`/trainer/manage/${memberId}`);
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex h-fit w-full px-7 py-6'>
        <div className='flex h-fit w-full justify-between rounded-md bg-gray-200 px-6 py-4'>
          <Button variant='ghost' size='icon' className='h-7 w-7'>
            <IconSearch />
          </Button>
          <input
            type='text'
            className={cn(
              'w-full bg-transparent px-5',
              twSelector('placeholder', cn(Typography.BODY_1, 'text-gray-500 '))
            )}
            onChange={handleSearchInput}
            placeholder='이름 검색'
          />
        </div>
      </div>
      {!isLoading && (
        <div className='hide-scrollbar mt-1 flex h-full flex-1 grow flex-col overflow-y-auto px-7'>
          <div className='mb-4 flex items-center justify-between'>
            <p className={Typography.BODY_2}>
              총{' '}
              <span className={cn(Typography.TITLE_3, 'text-primary-500')}>
                {studentsCount}
              </span>
              명
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className={cn(Typography.BODY_3, 'flex gap-x-1')}>
                  <IconArrowDownUp />
                  {sort.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='absolute -right-9 top-1 flex w-[96px] flex-col'>
                <DropdownMenuGroup className='flex flex-col'>
                  {Object.values(sortConditionMapper).map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      className={cn(
                        Typography.TITLE_3,
                        'px-6 py-5',
                        item.label === sort.label ? 'text-black' : 'text-gray-500'
                      )}
                      onClick={() => setSort(item)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {studentList === null && (
            <div className='mb-[30%] flex h-full flex-col items-center justify-center gap-y-11'>
              <div className='flex flex-col items-center gap-y-5'>
                <IconAlertCircle />
                <p className={cn(Typography.TITLE_1_BOLD, 'text-gray-700')}>
                  등록된 회원이 없습니다.
                </p>
              </div>
              <AddStudentDialog>
                <Button
                  variant='default'
                  className={cn(
                    Typography.TITLE_3,
                    'flex h-12 w-[146px] items-center gap-x-1 px-8 py-3'
                  )}>
                  <IconPlus fill='white' />
                  회원 등록하기
                </Button>
              </AddStudentDialog>
            </div>
          )}
          {studentList !== null && processedStudentList.length === 0 && (
            <div className='mb-[30%] flex h-full flex-col items-center justify-center'>
              <div className='flex flex-col items-center gap-y-11'>
                <div className='flex flex-col items-center gap-y-5'>
                  <IconAlertCircle />
                  <p className={cn(Typography.TITLE_1_BOLD, 'text-gray-500')}>
                    검색 결과가 없습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
          {studentList !== null && processedStudentList.length > 0 && (
            <div className='flex w-full flex-col gap-y-4 pb-8'>
              {processedStudentList.map((item) => {
                return (
                  <button
                    key={item.memberId}
                    onClick={() => onClickStudent(item.memberId)}>
                    <div className='flex h-[72px] justify-between rounded-lg bg-white px-6 py-7'>
                      <div className='flex items-center gap-x-6'>
                        <div className='relative'>
                          {item.fileUrl ? (
                            <Image
                              width={32}
                              height={32}
                              src={`${item.fileUrl}?w=300&h=300&q=90`}
                              alt='profile'
                              className={cn(
                                'h-10 w-10 rounded-full border border-gray-300 object-contain',
                                profileBorderStyleMapper(item.ranking)
                              )}
                            />
                          ) : (
                            <IconProfileDefault width={32} height={32} />
                          )}
                        </div>
                        <div className='flex flex-col text-left'>
                          <div className='flex flex-row gap-2'>
                            <p className={cn(Typography.TITLE_1_BOLD)}>{item.name}</p>
                            {!item.nonmember && (
                              <span className='flex-center rounded-sm bg-blue-50 px-3 py-[1.5px] text-[10px] text-primary'>
                                가입
                              </span>
                            )}
                          </div>
                          {item.nickName && (
                            <span
                              className={cn(Typography.BODY_4_REGULAR, 'text-gray-500')}>
                              {item.nickName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <span
                          className={cn(Typography.BODY_3, 'mr-[2px] text-primary-500')}>
                          잔여
                        </span>
                        <span className={cn(Typography.TITLE_3, 'text-primary-500')}>
                          {item.remainLessonCnt}
                        </span>
                        <span className={cn(Typography.BODY_2, 'text-gray-400')}>
                          /{item.lessonCnt}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { StudentList };
