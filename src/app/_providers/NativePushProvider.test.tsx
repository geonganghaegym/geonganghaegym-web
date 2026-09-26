import { act, render, waitFor } from '@testing-library/react';

import { authApi, useAuthSelector } from '@/entity/auth';
import { getAuthSessionRevision } from '@/entity/auth/model/store';
import { nativePushCommand } from '@/shared/lib/native-push';

import { NativePushProvider } from './NativePushProvider';

jest.mock('../../entity/auth', () => ({
  authApi: { post: jest.fn() },
  useAuthSelector: jest.fn(),
}));
jest.mock('../../entity/auth/model/store', () => ({
  getAuthSessionRevision: jest.fn(() => 0),
}));
jest.mock('../../shared/lib/native-push', () => ({
  ...jest.requireActual<typeof import('../../shared/lib/native-push')>(
    '../../shared/lib/native-push'
  ),
  nativePushCommand: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/unbound-method
const post = jest.mocked(authApi.post);

const token = { token: 'device-token', deviceType: 'IOS' };

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(getAuthSessionRevision).mockReturnValue(0);
  jest
    .mocked(useAuthSelector)
    .mockReturnValue({ userId: 'a', memberId: 1, accessToken: 'access' });
  jest.mocked(nativePushCommand).mockResolvedValue(token);
  post.mockResolvedValue({ data: null });
});

it('로그인 세션으로 네이티브 토큰을 등록하고 갱신 이벤트도 처리한다', async () => {
  render(<NativePushProvider />);
  await waitFor(() =>
    expect(post).toHaveBeenCalledWith('/api/v1/push/webview', token, expect.anything())
  );
  await act(async () => {
    window.dispatchEvent(
      new CustomEvent('nativePushTokenChanged', {
        detail: { token: 'renewed-device-token', deviceType: 'AOS' },
      })
    );
    await Promise.resolve();
  });
  expect(localStorage.getItem('serviceWorkerRegistration')).toBe('renewed-device-token');
});

it('비로그인 상태에서는 네이티브 토큰을 요청하거나 등록하지 않는다', () => {
  jest
    .mocked(useAuthSelector)
    .mockReturnValue({ userId: undefined, memberId: null, accessToken: undefined });
  render(<NativePushProvider />);
  window.dispatchEvent(new CustomEvent('nativePushTokenChanged', { detail: token }));
  expect(nativePushCommand).not.toHaveBeenCalled();
  expect(post).not.toHaveBeenCalled();
});

it('토큰 요청 중 로그아웃하면 늦게 반환된 토큰을 등록하지 않는다', async () => {
  let resolveToken!: (value: unknown) => void;
  jest.mocked(nativePushCommand).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveToken = resolve;
      })
  );
  const { rerender } = render(<NativePushProvider />);
  jest
    .mocked(useAuthSelector)
    .mockReturnValue({ userId: undefined, memberId: null, accessToken: undefined });
  jest.mocked(getAuthSessionRevision).mockReturnValue(1);
  rerender(<NativePushProvider />);
  await act(async () => {
    resolveToken(token);
    await Promise.resolve();
  });
  expect(post).not.toHaveBeenCalled();
  expect(localStorage.getItem('serviceWorkerRegistration')).toBeNull();
});
