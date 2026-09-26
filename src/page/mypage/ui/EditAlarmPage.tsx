'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useToggleAlarmStatusMutation } from '@/feature/manage';
import { useMyInfoQuery } from '@/feature/mypage';
import { IconBack } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, Switch, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const EditAlarmPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data } = useMyInfoQuery();
  const { errorToast } = useToast();
  const { mutate } = useToggleAlarmStatusMutation();

  const changeAlarm = (
    checked: boolean,
    type: 'PUSH' | 'COMMUNITY' | 'FEEDBACK' | 'SCHEDULENOTICE'
  ) => {
    const status = checked ? 'ENABLED' : 'DISABLE';
    mutate(
      { type, status },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({ queryKey: ['myinfo'] });
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  return (
    <Layout>
      <Layout.Header className='bg-white'>
        <Button variant='ghost' className='p-0' onClick={() => router.back()}>
          <IconBack />
        </Button>
      </Layout.Header>
      <Layout.Contents>
        <h1 className={cn(Typography.HEADING_3, 'bg-white px-7 pb-7 pt-8')}>알림 설정</h1>
        <section className='flex items-center justify-between bg-white px-7 py-[18px]'>
          <p className={cn(Typography.BODY_1)}>앱 푸시 알림</p>
          {data?.pushAlarmStatus && (
            <Switch
              id='PUSH'
              checked={data.pushAlarmStatus === 'ENABLED'}
              onCheckedChange={(checked) => changeAlarm(checked, 'PUSH')}
            />
          )}
        </section>
        <section className='mt-3 flex items-center justify-between bg-white px-7 py-6'>
          <div className='flex flex-col'>
            <p className={cn(Typography.BODY_1)}>커뮤니티</p>
            <span className={cn(Typography.BODY_2, 'text-gray-600')}>
              내 글에 댓글, 좋아요
            </span>
          </div>
          {data?.scheduleNoticeStatus && (
            <Switch
              id='COMMUNITY'
              checked={data.communityAlarmStatus === 'ENABLED'}
              onCheckedChange={(checked) => changeAlarm(checked, 'COMMUNITY')}
            />
          )}
        </section>
        <section className='flex items-center justify-between bg-white px-7 py-6'>
          <div className='flex flex-col'>
            <p className={cn(Typography.BODY_1)}>피드백</p>
            <span className={cn(Typography.BODY_2, 'text-gray-600')}>
              수업 일지, 식단 피드백 작성 알림
            </span>
          </div>
          {data?.feedbackAlarmStatus && (
            <Switch
              id='FEEDBACK'
              checked={data.feedbackAlarmStatus === 'ENABLED'}
              onCheckedChange={(checked) => changeAlarm(checked, 'FEEDBACK')}
            />
          )}
        </section>
      </Layout.Contents>
    </Layout>
  );
};

export { EditAlarmPage };
