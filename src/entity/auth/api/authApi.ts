import { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { api, BaseResponse, generateAxiosInstance } from '@/shared/api';

import { auth, getAuthSessionRevision, useAuthAction } from '../model/store';
import { UserInfo } from '../model/types';

/**
 * @description 토큰 O
 */
const authApi = generateAxiosInstance();

type RetryableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sessionRevision?: number;
};

authApi.interceptors.request.use(
  (request) => {
    const config = request as RetryableConfig;
    if (
      config._sessionRevision !== undefined &&
      config._sessionRevision !== getAuthSessionRevision()
    ) {
      throw new Error('Authentication session changed');
    }
    config._sessionRevision = getAuthSessionRevision();
    const { tokens } = auth();
    if (tokens) {
      request.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return request;
  },
  async (error) => {
    return await Promise.reject(error);
  }
);

// 동시에 여러 요청이 401을 받아도 refresh-token 호출은 하나만 나가도록 진행 중인 refresh를 공유한다.
let refreshPromise: Promise<UserInfo> | null = null;
let refreshRevision: number | undefined;

const refreshAccessToken = (userId: string, refreshToken: string) => {
  const revision = getAuthSessionRevision();
  if (!refreshPromise || refreshRevision !== revision) {
    refreshRevision = revision;
    refreshPromise = requestRefreshToken(userId, refreshToken)
      .then(({ data }) => {
        if (revision !== getAuthSessionRevision()) {
          throw new Error('Authentication session changed');
        }
        useAuthAction().setUserInfo(data);
        return data;
      })
      .finally(() => {
        if (refreshRevision === revision) refreshPromise = null;
      });
  }
  return refreshPromise;
};

authApi.interceptors.response.use(
  async (response) => {
    if (
      (response.config as RetryableConfig)._sessionRevision !== getAuthSessionRevision()
    ) {
      throw new Error('Authentication session changed');
    }
    return await Promise.resolve(response);
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originRequest = error.config as RetryableConfig | undefined;

    if (status !== 401 || !originRequest || originRequest._retry) {
      return await Promise.reject(error);
    }

    if (originRequest._sessionRevision !== getAuthSessionRevision()) {
      return await Promise.reject(error);
    }
    const revision = getAuthSessionRevision();
    const { tokens, userId } = auth();
    const refreshToken = tokens?.refreshToken;

    if (!refreshToken || !userId) {
      return await Promise.reject(error);
    }

    // 재시도한 요청이 다시 401을 받았을 때 이 분기를 또 타지 않도록 표시한다.
    originRequest._retry = true;

    try {
      await refreshAccessToken(userId, refreshToken);
    } catch {
      if (revision === getAuthSessionRevision()) {
        useAuthAction().deleteUserInfo();
        window.location.href = '/';
      }
      return await Promise.reject(error);
    }

    return await authApi(originRequest);
  }
);

const requestRefreshToken = async (userId: string, refreshToken: string) => {
  const result = await api.post<BaseResponse<UserInfo>>(`/api/v1/auth/refresh-token`, {
    userId,
    refreshToken,
  });
  return result.data;
};

export { authApi };
