'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

export const SignUpCompletePage = () => {
  const searchParams = useSearchParams();
  const type = searchParams?.get('type');
  const name = searchParams?.get('name');
  if (!type || !name) {
    throw new Error();
  }

  return (
    <Layout className='bg-white'>
      <Layout.Contents>
        <div className='flex h-full w-full flex-col items-center justify-between p-7'>
          <div className='flex h-full w-full flex-col items-center justify-center'>
            <Image
              className='mb-7'
              src='/images/signUpComplete.png'
              width={100}
              height={100}
              alt='signUp complete'
            />
            <span className={cn(Typography.HEADING_4_BOLD, 'mb-1 text-primary-500')}>
              가입 완료
            </span>
            <p
              className={cn(
                Typography.HEADING_1,
                'text-gray-800'
              )}>{`${name}님, 환영합니다!`}</p>
          </div>

          <div className='w-full'>
            <Button asChild>
              <Link
                href={`/sign-in?type=${type}`}
                className={cn(Typography.TITLE_1_BOLD, 'h-[57px] w-full rounded-lg')}>
                확인
              </Link>
            </Button>
          </div>
        </div>
      </Layout.Contents>
    </Layout>
  );
};
