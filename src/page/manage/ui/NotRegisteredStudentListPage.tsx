'use client';

import Link from 'next/link';
import { ChangeEvent, useState } from 'react';

import { Member, useNotRegisteredStudentsQuery } from '@/feature/manage';
import { useMyInfoQuery } from '@/feature/mypage';
import { IconAlertCircle, IconSearch } from '@/shared/assets';
import CloseIcon from '@/shared/assets/images/icon_close.svg';
import { Typography } from '@/shared/mixin';
import { Button, Card } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const MemberListController = (students: Member[]) => ({
  search: (keyword: string) => {
    const searchedStudents = students.filter((student) =>
      student.name.includes(keyword.toLowerCase())
    );
    return MemberListController(searchedStudents);
  },
  get: () => students,
});

export const NotRegisteredStudentListPage = () => {
  const { data: myInfo } = useMyInfoQuery();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isPending } = useNotRegisteredStudentsQuery();

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const processedMemberList = MemberListController(data ?? [])
    .search(searchQuery)
    .get();

  return (
    <Layout>
      <Layout.Header>
        <div className='w-[40px] cursor-default bg-transparent' tabIndex={-1}></div>
        <h1 className={cn(Typography.HEADING_4_SEMIBOLD)}>{myInfo?.gym.name}</h1>
        <Button
          variant='outline'
          className='border-none bg-transparent p-0 hover:bg-transparent'
          asChild>
          <Link href={'/trainer/manage'}>
            <CloseIcon width={20} height={20} />
          </Link>
        </Button>
      </Layout.Header>
      <Layout.Contents className='flex h-full flex-col px-7 pb-6'>
        <div className='flex h-fit w-full py-6'>
          <div className='flex h-fit w-full justify-between rounded-md bg-gray-200 px-6 py-4'>
            <Button variant='ghost' size='icon' className='h-7 w-7'>
              <IconSearch />
            </Button>
            {/* 공통 인풋 적용 예정 */}
            <input
              type='text'
              className='w-full bg-transparent px-5'
              placeholder='이름 검색'
              onChange={handleSearchInput}
            />
          </div>
        </div>
        {!isPending && processedMemberList.length === 0 && (
          <div className='flex h-full flex-col items-center justify-center'>
            <div className='mb-[30%] flex h-full flex-col items-center justify-center'>
              <div className='flex flex-col items-center gap-y-11'>
                <div className='flex flex-col items-center gap-y-5'>
                  <IconAlertCircle />
                  <p className='text-6/[130%] font-bold text-gray-500'>
                    {data === null ? '등록된 회원이 없습니다.' : '검색 결과가 없습니다.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isPending &&
          processedMemberList.length !== 0 &&
          processedMemberList.map(({ name, id, email }) => (
            <Card
              key={id}
              className='my-1 flex w-full flex-row items-center justify-between px-6 py-7'>
              <div className='flex flex-col gap-y-1'>
                <p className={Typography.TITLE_1_BOLD}>{name}</p>
                <span className={cn(Typography.BODY_4_REGULAR, 'text-gray-400')}>
                  {email}
                </span>
              </div>
              <Button variant='secondary' className='px-11 py-2' asChild>
                <Link
                  href={{
                    pathname: `/trainer/manage/append/${id}`,
                    query: { name: name },
                  }}>
                  추가
                </Link>
              </Button>
            </Card>
          ))}
      </Layout.Contents>
    </Layout>
  );
};
