'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { SocialProvider, useAuthAction, useSocialSignInMutation } from '@/entity/auth';
import { useToast } from '@/shared/ui';

interface StateType {
  memberType: 'trainer' | 'student';
  uuid?: string;
}

interface Props {
  params: { provider: SocialProvider };
}

export default function Page({ params }: Props) {
  const router = useRouter();
  const { mutate } = useSocialSignInMutation();
  const { setUserInfo } = useAuthAction();
  const { errorToast } = useToast();

  const provider = params.provider;
  const searchParams = useSearchParams();
  const code = searchParams?.get('code');
  const state = searchParams?.get('state');
  const id_token = searchParams?.get('id_token');
  const user = searchParams?.get('user');
  let parsedUser: {
    name: { firstName: string; lastName: string };
    email: string;
  } | null = null;
  if (user) {
    try {
      parsedUser = JSON.parse(user) as {
        name: { firstName: string; lastName: string };
        email: string;
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Invalid user JSON', error);
    }
  }

  useEffect(() => {
    if (!code || !state) return router.replace('/');

    const stringifiedValue = localStorage.getItem(state);
    localStorage.removeItem(state);
    if (!stringifiedValue) {
      errorToast();
      return router.replace('/');
    }

    const { memberType, uuid } = JSON.parse(stringifiedValue) as StateType;

    mutate(
      {
        provider,
        code,
        state,
        memberType: memberType.toUpperCase(),
        ...(uuid && { uuid }),
        ...(id_token && { id_token }),
        ...(parsedUser && { user: parsedUser }),
      },
      {
        onSuccess: (result) => {
          const data = result.data;
          setUserInfo(data);
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            window.flutter_inappwebview.callHandler('Channel', data.memberId);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
          router.push(`/${data.memberType?.toLowerCase()}`);
        },
        onError: (error) => {
          errorToast(error.response?.data.message);
          router.replace('/');
        },
      }
    );
  }, []);

  if (!code || !state) throw new Error();

  return null;
}
