'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Layout className='bg-white'>
      <Layout.Contents>
        <div className='flex h-full w-full flex-col items-center justify-between p-7'>
          <div className='flex h-full w-full flex-col items-center justify-center gap-y-2'>
            <p className={cn(Typography.HEADING_3, 'text-gray-800')}>
              문제가 발생했습니다
            </p>
            <p className={cn(Typography.BODY_2, 'text-gray-500')}>
              잠시 후 다시 시도하거나 홈으로 이동해 주세요.
            </p>
          </div>
          <div className='flex w-full flex-col gap-y-2'>
            <Button
              onClick={reset}
              className={cn(Typography.TITLE_1_BOLD, 'h-[57px] w-full rounded-lg')}>
              다시 시도
            </Button>
            <Button
              asChild
              variant='outline'
              className={cn(Typography.TITLE_1_BOLD, 'h-[57px] w-full rounded-lg')}>
              <Link href='/'>홈으로</Link>
            </Button>
          </div>
        </div>
      </Layout.Contents>
    </Layout>
  );
}
