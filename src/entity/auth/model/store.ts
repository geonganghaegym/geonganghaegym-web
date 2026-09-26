import { devtools, persist } from 'zustand/middleware';
import { createWithEqualityFn } from 'zustand/traditional';

import { nativePushCommand } from '@/shared/lib/native-push';
import { clearSessionQueries } from '@/shared/lib/query-client';
import { withSelector } from '@/shared/utils';

import { UserInfo } from './types';

type AuthState = Partial<UserInfo>;

interface AuthAction {
  setUserInfo: (userinfo: AuthState) => void;
  deleteUserInfo: () => void;
}

const AUTH_STATE_NAME = 'auth-storage';

const DEFAULT_AUTH_STATE: AuthState = {
  userId: undefined,
  accessToken: undefined,
  refreshToken: undefined,
  gymId: undefined,
  memberType: null,
  memberId: null,
  name: null,
};

const authStore = () => DEFAULT_AUTH_STATE;

const useAuthStore = createWithEqualityFn(
  persist(
    devtools<AuthState>(authStore, { enabled: process.env.NODE_ENV !== 'production' }),
    { name: AUTH_STATE_NAME }
  )
);

let sessionRevision = 0;

export const getAuthSessionRevision = () => sessionRevision;

const clearSession = () => {
  sessionRevision += 1;
  clearSessionQueries();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('serviceWorkerRegistration');
    void nativePushCommand('logout').catch(() => undefined);
  }
};

const useAuthAction = (): AuthAction => ({
  setUserInfo: (userInfo) => {
    const previous = useAuthStore.getState();
    if (
      ('userId' in userInfo && previous.userId !== userInfo.userId) ||
      ('memberId' in userInfo && previous.memberId !== userInfo.memberId) ||
      ('memberType' in userInfo && previous.memberType !== userInfo.memberType)
    ) {
      clearSession();
    }
    useAuthStore.setState(() => ({ ...userInfo }));
  },
  deleteUserInfo: () => {
    clearSession();
    useAuthStore.setState(authStore);
  },
});

const useAuthSelector = withSelector(useAuthStore);

const auth = () => {
  const store = localStorage.getItem(AUTH_STATE_NAME);
  if (!store) {
    return { tokens: null, memberType: null, userId: null };
  }
  const { state } = JSON.parse(store) as {
    state: UserInfo;
  };
  const { accessToken, refreshToken, memberType, gymId, userId } = state;
  const tokens = { accessToken, refreshToken };
  return { tokens, memberType, gymId, userId };
};

export { auth, useAuthAction, useAuthSelector };
