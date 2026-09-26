'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent } from 'react';

import { useAuthAction } from '@/entity/auth';
import {
  useDeleteProfileImageMutation,
  useLogOutMutation,
  useMyInfoQuery,
  useSetProfileImageMutation,
} from '@/feature/mypage';
import {
  IconArrowRightSmall,
  IconAvatar,
  IconBack,
  IconCamera,
  IconGoogleLogo,
  IconKakaoLogo,
  IconNaverLogo,
} from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, useToast } from '@/shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const EditMyInfoPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { errorToast } = useToast();
  const { deleteUserInfo } = useAuthAction();
  const { data } = useMyInfoQuery();
  const { mutate: deleteProfileImage } = useDeleteProfileImageMutation();
  const { mutate: setProfileImage } = useSetProfileImageMutation();
  const { mutate: logoutMutate } = useLogOutMutation();

  const onChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(
        { file },
        {
          onSuccess: async () => {
            await queryClient.refetchQueries({
              queryKey: ['myinfo'],
            });
          },
          onError: (error) => {
            const message = error?.response?.data.message ?? '문제가 발생했습니다.';
            errorToast(message);
          },
        }
      );
    }
  };

  const onClickDeleteProfileImage = () => {
    deleteProfileImage(undefined, {
      onSuccess: async () => {
        await queryClient.refetchQueries({
          queryKey: ['myinfo'],
        });
      },
      onError: (error) => {
        const message = error?.response?.data.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  const isSocialAccount = data?.socialType !== 'NONE';

  const onClickLogOut = () => {
    logoutMutate(undefined, {
      onSuccess: async () => {
        deleteUserInfo();
        localStorage.clear();
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
        router.push('/');
      },
      onError: (error) => {
        const message = error.response?.data?.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  return (
    <Layout className='bg-white'>
      <Layout.Header>
        <Button variant='ghost' className='p-0' onClick={() => router.back()}>
          <IconBack />
        </Button>
      </Layout.Header>
      {data && (
        <Layout.Contents className='flex flex-col'>
          <section className='flex w-full flex-col items-center justify-center gap-6 pt-6'>
            <div className='relative'>
              {data.profile ? (
                <Image
                  src={`${data.profile.fileUrl}?w=300&h=300&=q=90`}
                  alt='profile'
                  width={80}
                  height={80}
                  className='h-[80px] w-[80px] rounded-full border border-gray-300 object-cover'
                  priority
                />
              ) : (
                <IconAvatar width={82} height={82} />
              )}
              <DropdownMenu>
                {/* TODO) input이 Content 내부에 있으면, DropdownMenu가 닫힐 때 DOM 트리에서 사라져서 Image를 다룰 수가 없음 */}
                <input
                  id='image-input'
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={onChangeImage}
                />
                <DropdownMenuTrigger className='absolute -bottom-1 -right-1 select-none rounded-full border border-gray-300 bg-white p-2 outline-none ring-0'>
                  <IconCamera fill={'var(--gray-500)'} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem className={cn(Typography.TITLE_3, 'px-6 py-5 ')}>
                      <label htmlFor='image-input'>앨범에서 선택</label>
                    </DropdownMenuItem>
                    {data.profile && (
                      <DropdownMenuItem
                        className={cn(Typography.TITLE_3, 'px-6 py-[13.5px]')}
                        onClick={onClickDeleteProfileImage}>
                        사진 삭제
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h3 className={cn(Typography.HEADING_2)}>{data?.name}</h3>
          </section>
          {isSocialAccount ? (
            <section className='flex-grow'>
              <div className='mx-7 mt-11 rounded-lg border border-gray-100'>
                <div className='flex items-center justify-between border-b border-gray-100 px-6 py-7'>
                  <p className={cn(Typography.TITLE_1_SEMIBOLD)}>이름</p>
                  <div
                    className={cn(
                      Typography.BODY_3,
                      'flex items-center gap-3 text-gray-500'
                    )}>
                    {data?.name}
                  </div>
                </div>
                <div className='flex items-center justify-between border-b border-gray-100 px-6 py-7'>
                  <p className={cn(Typography.TITLE_1_SEMIBOLD)}>이메일</p>
                  <div
                    className={cn(
                      Typography.BODY_3,
                      'flex items-center gap-3 text-gray-500'
                    )}>
                    {data?.email}
                  </div>
                </div>
                <div className='flex items-center justify-between px-6 py-7'>
                  <p className={cn(Typography.TITLE_1_SEMIBOLD)}>계정 연동 설정</p>
                  {data.socialType === 'KAKAO' && (
                    <div className='flex-center rounded-full bg-[#FEE500] p-1'>
                      <IconKakaoLogo />
                    </div>
                  )}
                  {data.socialType === 'GOOGLE' && (
                    <div className='flex-center rounded-full bg-white p-1'>
                      <IconGoogleLogo />
                    </div>
                  )}
                  {data.socialType === 'NAVER' && (
                    <div className='flex-center rounded-full bg-[#03C75A] p-1'>
                      <IconNaverLogo />
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className='flex-grow'>
              <div className='mx-7 mt-11 rounded-lg border border-gray-100'>
                <Link href={'./edit/name'}>
                  <div className='flex items-center justify-between border-b border-gray-100 px-6 py-7'>
                    <p className={cn(Typography.TITLE_1_SEMIBOLD)}>이름</p>
                    <div
                      className={cn(
                        Typography.BODY_3,
                        'flex items-center gap-3 text-gray-500'
                      )}>
                      {data.name}
                      <IconArrowRightSmall />
                    </div>
                  </div>
                </Link>
                <Link href={'./edit/email'}>
                  <div className='flex items-center justify-between border-b border-gray-100 px-6 py-7'>
                    <p className={cn(Typography.TITLE_1_SEMIBOLD)}>이메일</p>
                    <div
                      className={cn(
                        Typography.BODY_3,
                        'flex items-center gap-3 text-gray-500'
                      )}>
                      {data.email}
                      <IconArrowRightSmall />
                    </div>
                  </div>
                </Link>
                <Link href={'./edit/password'}>
                  <div className='flex items-center justify-between px-6 py-7'>
                    <p className={cn(Typography.TITLE_1_SEMIBOLD)}>비밀번호 변경</p>
                    <IconArrowRightSmall />
                  </div>
                </Link>
              </div>
            </section>
          )}
          <section className='mb-[60px] mt-auto flex w-full items-center justify-center gap-3'>
            <button
              className={cn(Typography.BODY_2, 'bg-transparent text-gray-500')}
              onClick={onClickLogOut}>
              로그아웃
            </button>
            <div className='h-4 w-[1px] bg-gray-300' />
            <Link href={'./leave'} className={cn(Typography.BODY_2, 'text-gray-500')}>
              탈퇴하기
            </Link>
          </section>
        </Layout.Contents>
      )}
    </Layout>
  );
};

export { EditMyInfoPage };
