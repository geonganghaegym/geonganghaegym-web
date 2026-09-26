import {
  notifyLegacyNativeLogin,
  resumeNativePushRegistration,
  runNativePushRegistration,
  suspendNativePushRegistration,
} from './native-push';

it('로그아웃 전에 진행 중 등록을 기다리고 이후 등록은 차단한다', async () => {
  resumeNativePushRegistration();
  let finish!: () => void;
  const pending = runNativePushRegistration(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  const logout = jest.fn();
  const drain = suspendNativePushRegistration().then(logout);
  const lateRegistration = jest.fn(() => Promise.resolve());
  expect(await runNativePushRegistration(lateRegistration)).toBe(false);
  expect(lateRegistration).not.toHaveBeenCalled();
  expect(logout).not.toHaveBeenCalled();
  finish();
  await Promise.all([pending, drain]);
  expect(logout).toHaveBeenCalledTimes(1);
  resumeNativePushRegistration();
});

describe('notifyLegacyNativeLogin', () => {
  afterEach(() => {
    delete (window as { flutter_inappwebview?: unknown }).flutter_inappwebview;
  });

  it('구버전 앱이 알아듣도록 memberId를 숫자 그대로 Channel에 보낸다', () => {
    const callHandler = jest.fn(() => Promise.resolve());
    Object.assign(window, { flutter_inappwebview: { callHandler } });
    notifyLegacyNativeLogin(42);
    expect(callHandler).toHaveBeenCalledWith('Channel', 42);
  });

  it('앱이 거절하거나 브릿지·memberId가 없어도 예외를 던지지 않는다', async () => {
    notifyLegacyNativeLogin(42);
    const callHandler = jest.fn(() => Promise.reject(new Error('cast error')));
    Object.assign(window, { flutter_inappwebview: { callHandler } });
    notifyLegacyNativeLogin(null);
    expect(callHandler).not.toHaveBeenCalled();
    expect(() => notifyLegacyNativeLogin(42)).not.toThrow();
    await Promise.resolve();
  });
});
