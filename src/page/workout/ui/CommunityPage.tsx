'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { LowercaseMemberType } from '@/entity/auth';
import { useMyInfoQuery } from '@/feature/mypage';
import { CommunityNoPosts, CommunityPost, useCommunityQuery } from '@/feature/workout';
import { IconBack } from '@/shared/assets';
import { useQueryString } from '@/shared/hooks';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const CommunityPage = () => {
  const router = useRouter();
  const { getQueryString } = useQueryString();

  const memberId = getQueryString('memberId');

  const { data: userInfo } = useMyInfoQuery();
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isError, error } =
    useCommunityQuery({
      memberId,
    });

  const lowercaseMemberType = userInfo?.memberType.toLowerCase() as LowercaseMemberType;
  const posts = data?.pages.flatMap((page) => page.content).filter(Boolean);

  const [ref, inView] = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(() => {
        throw new Error('Error fetching next page');
      });
    }
  }, [fetchNextPage, hasNextPage, inView]);

  if (isError) {
    throw new Error(error.message);
  }

  return (
    <Layout type={lowercaseMemberType}>
      {!memberId && (
        <Layout.Header className='relative'>
          <h1 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
            {userInfo?.gym.name}
          </h1>
        </Layout.Header>
      )}
      {memberId && posts && (
        <Layout.Header className='relative'>
          <Button variant='ghost' className='p-0' onClick={() => router.back()}>
            <IconBack />
          </Button>
          <h1 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
            {posts[0].member.name}님 운동기록
          </h1>
        </Layout.Header>
      )}

      <Layout.Contents className='pt-6'>
        {posts && (
          <div className='hide-scrollbar flex h-full flex-1 grow flex-col overflow-y-auto px-7 pb-7'>
            <div className='flex w-full flex-col gap-5'>
              {posts.length === 0 && <CommunityNoPosts />}
              {posts.length > 0 &&
                posts.map((workout) => {
                  return (
                    <Link
                      key={workout.workoutHistoryId}
                      href={`/${lowercaseMemberType}/community/${workout.workoutHistoryId}`}>
                      <CommunityPost workout={workout} />
                    </Link>
                  );
                })}
            </div>
            <div ref={ref} className='flex-center p-7'>
              {isFetchingNextPage && (
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              )}
            </div>
          </div>
        )}
      </Layout.Contents>
    </Layout>
  );
};

export { CommunityPage };
