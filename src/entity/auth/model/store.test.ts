import { act } from '@testing-library/react';

import { queryClient } from '@/shared/lib/query-client';

import { auth, useAuthAction } from './store';

// zustand 5 업그레이드 회귀 방지. authApi 인터셉터는 토큰 갱신 직후 auth()로 localStorage를 다시 읽어
// 재시도 요청에 새 토큰을 붙이므로, setUserInfo가 localStorage에 "동기적으로" 반영돼야 한다.
describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => useAuthAction().deleteUserInfo());
  });

  it('setUserInfo 직후 auth()가 새 토큰을 읽는다', () => {
    act(() =>
      useAuthAction().setUserInfo({
        userId: 'user-1',
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        memberType: 'TRAINER',
        gymId: 3,
      })
    );

    expect(auth()).toEqual({
      tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' },
      memberType: 'TRAINER',
      gymId: 3,
      userId: 'user-1',
    });
  });

  it('deleteUserInfo 후에는 토큰이 비어 있다', () => {
    act(() => useAuthAction().setUserInfo({ accessToken: 'a', refreshToken: 'r' }));
    act(() => useAuthAction().deleteUserInfo());

    expect(auth().tokens).toEqual({ accessToken: undefined, refreshToken: undefined });
    expect(auth().memberType).toBeNull();
  });

  it('저장된 값이 없으면 로그아웃 상태를 돌려준다', () => {
    localStorage.clear();

    expect(auth()).toEqual({ tokens: null, memberType: null, userId: null });
  });
});

describe('계정별 조회 캐시 격리', () => {
  beforeEach(() => useAuthAction().deleteUserInfo());

  it('로그아웃 시 개인 데이터 캐시를 삭제한다', () => {
    useAuthAction().setUserInfo({ userId: 'a', accessToken: 'a-token' });
    queryClient.setQueryData(['StudentHomeData'], { diet: 'private-a' });
    useAuthAction().deleteUserInfo();
    expect(queryClient.getQueryData(['StudentHomeData'])).toBeUndefined();
  });

  it('다른 계정 로그인 시 캐시를 삭제하고 같은 계정 토큰 갱신 때는 보존한다', () => {
    useAuthAction().setUserInfo({ userId: 'a', accessToken: 'a-token' });
    queryClient.setQueryData(['StudentHomeData'], { diet: 'private-a' });
    useAuthAction().setUserInfo({ userId: 'a', accessToken: 'renewed-token' });
    expect(queryClient.getQueryData(['StudentHomeData'])).toEqual({ diet: 'private-a' });
    useAuthAction().setUserInfo({ userId: 'b', accessToken: 'b-token' });
    expect(queryClient.getQueryData(['StudentHomeData'])).toBeUndefined();
  });

  it('로그아웃 전에 시작한 조회가 늦게 완료되어도 캐시를 복원하지 않는다', async () => {
    let resolve!: (data: string) => void;
    const pending = queryClient
      .fetchQuery({
        queryKey: ['private-data'],
        queryFn: () =>
          new Promise<string>((done) => {
            resolve = done;
          }),
      })
      .catch(() => undefined);
    useAuthAction().deleteUserInfo();
    resolve('previous-member');
    await pending;
    expect(queryClient.getQueryData(['private-data'])).toBeUndefined();
  });
});
