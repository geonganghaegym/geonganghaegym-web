'use client';

import { useEffect } from 'react';

import { authApi, useAuthSelector } from '@/entity/auth';
import { getAuthSessionRevision } from '@/entity/auth/model/store';
import {
  isNativePushToken,
  nativePushCommand,
  resumeNativePushRegistration,
  runNativePushRegistration,
} from '@/shared/lib/native-push';

/** Native owns the device token; the web owns authentication and token refresh. */
export const NativePushProvider = () => {
  const { userId, memberId, memberType, accessToken } = useAuthSelector([
    'userId',
    'memberId',
    'memberType',
    'accessToken',
  ]);
  const authenticated = Boolean(userId && accessToken);

  useEffect(() => {
    if (!authenticated) return;
    resumeNativePushRegistration();
    const revision = getAuthSessionRevision();
    const controller = new AbortController();

    const register = async (value: unknown) => {
      if (
        !isNativePushToken(value) ||
        controller.signal.aborted ||
        revision !== getAuthSessionRevision()
      )
        return;
      try {
        const registered = await runNativePushRegistration(() =>
          authApi.post('/api/v1/push/webview', value, {
            signal: controller.signal,
            timeout: 10000,
          })
        );
        if (!registered) return;
        if (!controller.signal.aborted && revision === getAuthSessionRevision()) {
          localStorage.setItem('serviceWorkerRegistration', value.token);
        }
      } catch {
        // Retry on the next app load, foreground transition or native token change.
      }
    };
    const requestToken = () => {
      void nativePushCommand('getPushToken')
        .then(register)
        .catch(() => undefined);
    };
    const onTokenChanged = (event: Event) => {
      void register((event as CustomEvent<unknown>).detail);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') requestToken();
    };

    window.addEventListener('nativePushTokenChanged', onTokenChanged);
    window.addEventListener('flutterInAppWebViewPlatformReady', requestToken);
    document.addEventListener('visibilitychange', onVisible);
    requestToken();
    return () => {
      controller.abort();
      window.removeEventListener('nativePushTokenChanged', onTokenChanged);
      window.removeEventListener('flutterInAppWebViewPlatformReady', requestToken);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [authenticated, userId, memberId, memberType]);

  return null;
};
