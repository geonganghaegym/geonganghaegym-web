import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { api } from '@/shared/api';

import { auth, getAuthSessionRevision, useAuthAction } from '../model/store';
import { authApi } from './authApi';

jest.mock('../model/store', () => ({
  auth: jest.fn(),
  getAuthSessionRevision: jest.fn(() => 0),
  useAuthAction: jest.fn(),
}));

// '@/shared/api' 는 jest.config.ts 에 moduleNameMapper 항목이 없어 jest.mock 의 리터럴
// 인자로는 해석되지 않는다(SWC가 실제 import 구문만 별칭을 치환한다) — 상대 경로로 mock한다.
jest.mock('../../../shared/api', () => ({
  ...jest.requireActual<typeof import('../../../shared/api')>('../../../shared/api'),
  api: { post: jest.fn() },
}));

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockedUseAuthAction = useAuthAction as jest.MockedFunction<typeof useAuthAction>;
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockedApiPost = api.post as jest.Mock;

const makeUnauthorizedError = (config: RetryableConfig) => {
  const response: AxiosResponse = {
    data: null,
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  };
  return new AxiosError(
    'Request failed with status code 401',
    'ERR_BAD_REQUEST',
    config,
    {},
    response
  );
};

const makeSuccessResponse = (config: RetryableConfig): AxiosResponse => ({
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

describe('authApi 401 재발급 인터셉터', () => {
  const setUserInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getAuthSessionRevision).mockReturnValue(0);

    mockedAuth.mockReturnValue({
      tokens: { accessToken: 'old-access-token', refreshToken: 'refresh-token' },
      memberType: null,
      gymId: null,
      userId: 'user-1',
    });
    mockedUseAuthAction.mockReturnValue({ setUserInfo, deleteUserInfo: jest.fn() });
    mockedApiPost.mockResolvedValue({
      data: {
        message: 'ok',
        data: {
          userId: 'user-1',
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          gymId: null,
          memberType: null,
          memberId: null,
          name: null,
        },
      },
    });
  });

  it('동시에 두 요청이 401을 받아도 refresh는 한 번만 호출되고 두 요청 모두 재시도되어 성공한다', async () => {
    authApi.defaults.adapter = jest.fn((config: RetryableConfig) =>
      config._retry
        ? Promise.resolve(makeSuccessResponse(config))
        : Promise.reject(makeUnauthorizedError(config))
    );

    const [res1, res2] = await Promise.all([authApi.get('/a'), authApi.get('/b')]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(mockedApiPost).toHaveBeenCalledTimes(1);
  });

  it('재시도한 요청이 다시 401을 받으면 refresh를 다시 호출하지 않고 그대로 reject한다', async () => {
    authApi.defaults.adapter = jest.fn((config: RetryableConfig) =>
      Promise.reject(makeUnauthorizedError(config))
    );

    await expect(authApi.get('/c')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(mockedApiPost).toHaveBeenCalledTimes(1);
  });
});

it('로그아웃 뒤 도착한 refresh 응답은 이전 로그인 상태를 복원하지 않는다', async () => {
  jest.mocked(getAuthSessionRevision).mockReturnValue(0);
  mockedAuth.mockReturnValue({
    tokens: { accessToken: 'old', refreshToken: 'refresh' },
    memberType: null,
    gymId: null,
    userId: 'a',
  });
  const setUserInfo = jest.fn();
  const deleteUserInfo = jest.fn();
  mockedUseAuthAction.mockReturnValue({ setUserInfo, deleteUserInfo });
  let resolveRefresh!: (result: unknown) => void;
  let refreshStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    refreshStarted = resolve;
  });
  mockedApiPost.mockImplementation(() => {
    refreshStarted();
    return new Promise((resolve) => {
      resolveRefresh = resolve;
    });
  });
  authApi.defaults.adapter = jest.fn((config: RetryableConfig) =>
    Promise.reject(makeUnauthorizedError(config))
  );
  const pending = authApi.get('/private');
  const rejected = expect(pending).rejects.toMatchObject({ response: { status: 401 } });
  await started;
  jest.mocked(getAuthSessionRevision).mockReturnValue(1);
  resolveRefresh({ data: { data: { userId: 'a', accessToken: 'new' } } });
  await rejected;
  expect(setUserInfo).not.toHaveBeenCalled();
  expect(deleteUserInfo).not.toHaveBeenCalled();
});
