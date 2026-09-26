'use client';

import 'dayjs/locale/ko';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { AlarmType, useAlarmQuery } from '@/entity/alarm';
import { StudentAlarmItem } from '@/feature/alarm';
import { IconAlarmBig, IconBack } from '@/shared/assets';
import { useQueryString } from '@/shared/hooks';
import { Typography } from '@/shared/mixin';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const NoAlarm = () => {
  return (
    <li
      className={cn(
        Typography.TITLE_1_BOLD,
        'flex-center flex-col py-[200px] text-gray-700'
      )}>
      <IconAlarmBig />
      <p className={cn(Typography.HEADING_4_BOLD, 'mt-6 text-gray-400')}>
        새로운 알림이 없습니다
      </p>
    </li>
  );
};

const ITEMS_PER_PAGE = 20;

const StudentAlarmPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getQueryString, setQueryString } = useQueryString();

  const validTabs: AlarmType[] = ['SCHEDULE', 'COMMUNITY'];
  const tabState: AlarmType = validTabs.includes(getQueryString('tab') as AlarmType)
    ? (getQueryString('tab') as AlarmType)
    : 'SCHEDULE';

  const { data, hasNextPage, fetchNextPage, isPending } = useAlarmQuery({
    type: tabState,
    size: ITEMS_PER_PAGE,
  });

  const [ref, inView] = useInView({
    threshold: 0.5,
  });

  const handleValueChange = (value: string) => {
    setQueryString('tab', value);
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(() => {
        throw new Error('Error fetching next page');
      });
    }
  }, [fetchNextPage, hasNextPage, inView]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['alarmList'] });
    };
  }, [queryClient]);

  return (
    <Layout>
      <Layout.Header className='relative bg-white'>
        <Button variant='ghost' className='p-0' onClick={() => router.back()}>
          <IconBack />
        </Button>
        <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>알림</h2>
      </Layout.Header>
      <Layout.Contents className='bg-white'>
        <Tabs
          value={tabState}
          className='flex h-full w-full flex-col'
          onValueChange={(value) => handleValueChange(value)}>
          <TabsList>
            <TabsTrigger value='SCHEDULE'>
              <p className={cn(Typography.TITLE_1_BOLD, 'relative')}>
                <span
                  className={
                    data?.pages?.[0].redDotStatus?.[0].redDotStatus &&
                    data?.pages?.[0].redDotStatus?.[0].notificationCategory === 'SCHEDULE'
                      ? 't-0 absolute -right-2 ml-[2px] h-1 w-1 rounded-full bg-point'
                      : ''
                  }
                />
                수업
              </p>
            </TabsTrigger>
            <TabsTrigger value='COMMUNITY' className='relative'>
              <p className={cn(Typography.TITLE_1_BOLD, 'relative')}>
                커뮤니티
                <span
                  className={
                    data?.pages?.[0].redDotStatus?.[0].redDotStatus &&
                    data?.pages?.[0].redDotStatus?.[0].notificationCategory ===
                      'COMMUNITY'
                      ? 'absolute ml-[2px] h-1 w-1 rounded-full bg-point'
                      : ''
                  }
                />
              </p>
            </TabsTrigger>
          </TabsList>
          <TabsContent value='SCHEDULE' className='mt-0 grow'>
            {isPending && (
              <div className='flex-center h-[500px] w-full'>
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              </div>
            )}
            {!isPending && (
              <ul>
                {data?.pages.map((item, index) => {
                  if (item.content === null || item.content.length === 0) {
                    return <NoAlarm key={`diet_${index}`} />;
                  }

                  return item.content.map((notification) => {
                    return (
                      <StudentAlarmItem
                        key={notification.notificationId}
                        data={notification}
                        sender={item.sender}
                      />
                    );
                  });
                })}
              </ul>
            )}

            {!data?.pages[data?.pages.length - 1].isLast && hasNextPage && (
              <div ref={ref} className='flex w-full justify-center p-3'>
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              </div>
            )}
          </TabsContent>
          <TabsContent value='COMMUNITY' className='mt-0 grow'>
            {isPending && (
              <div className='flex-center h-[500px] w-full'>
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              </div>
            )}
            {!isPending && (
              <ul>
                {data?.pages.map((item, index) => {
                  if (item.content === null || item.content.length === 0) {
                    return <NoAlarm key={`diet_${index}`} />;
                  }

                  return item.content.map((notification) => {
                    return (
                      <StudentAlarmItem
                        key={notification.notificationId}
                        data={notification}
                        sender={item.sender}
                      />
                    );
                  });
                })}
              </ul>
            )}

            {!data?.pages[data?.pages.length - 1].isLast && hasNextPage && (
              <div ref={ref} className='flex w-full justify-center p-3'>
                <Image src='/images/loading.gif' width={20} height={20} alt='loading' />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Layout.Contents>
    </Layout>
  );
};

export { StudentAlarmPage };
