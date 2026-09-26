export interface NativePushToken {
  token: string;
  deviceType: 'IOS' | 'AOS';
}

interface NativeBridge {
  callHandler: (name: string, command: { type: string } | number) => Promise<unknown>;
}

const getNativeBridge = () =>
  typeof window === 'undefined'
    ? undefined
    : (window as Window & { flutter_inappwebview?: NativeBridge }).flutter_inappwebview;

export const hasNativePushBridge = () =>
  typeof window !== 'undefined' && 'flutter_inappwebview' in window;

export const nativePushCommand = async (type: 'getPushToken' | 'logout') => {
  return getNativeBridge()?.callHandler('Channel', { type });
};

/**
 * 출시된 앱(1.1.0 이하)은 로그인 시 memberId를 받아 직접 토큰을 등록한다. 새 앱은 숫자 인자를 무시한다.
 * ponytail: 구버전 앱 호환용 — 새 앱이 충분히 퍼지고 backend가 /push/webview 인증을 강제할 때 지운다.
 */
export const notifyLegacyNativeLogin = (memberId: number | null | undefined) => {
  if (memberId == null) return;
  try {
    void getNativeBridge()
      ?.callHandler('Channel', memberId)
      .catch(() => undefined);
  } catch {
    // 브릿지가 없거나 동기 예외 — 웹 로그인은 계속 진행한다.
  }
};

export const isNativePushToken = (value: unknown): value is NativePushToken => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<NativePushToken>;
  return (
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    (candidate.deviceType === 'IOS' || candidate.deviceType === 'AOS')
  );
};

let registrationPaused = false;
const pendingRegistrations = new Set<Promise<unknown>>();

export const resumeNativePushRegistration = () => {
  registrationPaused = false;
};

/** Drain requests before server logout removes the device token. */
export const suspendNativePushRegistration = async () => {
  registrationPaused = true;
  await Promise.allSettled([...pendingRegistrations]);
};

export const runNativePushRegistration = async (register: () => Promise<unknown>) => {
  if (registrationPaused) return false;
  const pending = register();
  pendingRegistrations.add(pending);
  try {
    await pending;
    return true;
  } finally {
    pendingRegistrations.delete(pending);
  }
};
