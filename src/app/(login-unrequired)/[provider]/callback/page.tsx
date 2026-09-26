'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import { SocialProvider, useAuthAction, useSocialSignInMutation } from '@/entity/auth';
import { notifyLegacyNativeLogin } from '@/shared/lib/native-push';
import { useToast } from '@/shared/ui';

interface StateType {
  memberType: 'trainer' | 'student';
  uuid?: string;
}

interface Props {
  params: Promise<{ provider: SocialProvider }>;
}

export default function Page(props: Props) {
  const params = use(props.params);
  const router = useRouter();
  const { mutate } = useSocialSignInMutation();
  const { setUserInfo } = useAuthAction();
  const { errorToast } = useToast();

  const provider = params.provider;
  const searchParams = useSearchParams();
  const state = searchParams?.get('state');

  // 애플(form_post) 콜백은 code/id_token/user 를 쿼리 대신 URL fragment 로 받는다
  // (fragment 는 서버·프록시 로그에 남지 않는다). fragment 는 서버에서 읽을 수 없어
  // 마운트 후 useEffect 에서 읽는다 — 그 전까지는 hashParams 가 null 이다.
  const [hashParams, setHashParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    const parsed = new URLSearchParams(window.location.hash.slice(1));
    setHashParams(parsed);
    if (window.location.hash) {
      // Next App Router가 history.state 에 라우팅 트리를 넣어두므로 null로 덮어쓰지 않는다.
      history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, []);

  // 다른 provider(kakao/naver/google)는 여전히 쿼리로 받으므로 hash 값이 없으면 그대로 폴백한다.
  const isHashCallback = provider === 'apple';
  const ready = isHashCallback ? hashParams !== null : true;
  const code = hashParams?.get('code') ?? searchParams?.get('code') ?? null;
  const id_token = hashParams?.get('id_token') ?? searchParams?.get('id_token') ?? null;
  const user = hashParams?.get('user') ?? searchParams?.get('user') ?? null;
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
    if (!ready) return;
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
          notifyLegacyNativeLogin(data.memberId);
          router.push(`/${data.memberType?.toLowerCase()}`);
        },
        onError: (error) => {
          errorToast(error.response?.data.message);
          router.replace('/');
        },
      }
    );
  }, [ready]);

  if (ready && (!code || !state)) throw new Error();

  return null;
}
