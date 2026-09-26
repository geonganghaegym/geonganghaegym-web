export interface NativePushToken {
  token: string;
  deviceType: 'IOS' | 'AOS';
}

interface NativeBridge {
  callHandler: (name: string, command: { type: string }) => Promise<unknown>;
}

export const hasNativePushBridge = () =>
  typeof window !== 'undefined' && 'flutter_inappwebview' in window;

export const nativePushCommand = async (type: 'getPushToken' | 'logout') => {
  const bridge = (window as Window & { flutter_inappwebview?: NativeBridge })
    .flutter_inappwebview;
  return bridge?.callHandler('Channel', { type });
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
