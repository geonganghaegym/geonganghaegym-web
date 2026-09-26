import {
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
