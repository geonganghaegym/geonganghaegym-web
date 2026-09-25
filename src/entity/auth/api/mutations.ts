import { useMutation } from '@tanstack/react-query';

import { api, BaseError, BaseResponse } from '@/shared/api';

import { getRedirectUri } from '../consts';
import { SignUpRequest, SocialProvider, UserInfo } from '../model/types';
import { authApi } from './authApi';

export const useCheckVailableIdMutation = () => {
  return useMutation<BaseResponse<boolean>, BaseError, string>({
    mutationFn: async (userId) => {
      const result = await api.get<BaseResponse<boolean>>(
        `/api/v1/auth/validation/user-id?userId=${userId}`
      );
      return result.data;
    },
  });
};

interface CheckVerificationCodeRequest {
  email: string;
  emailKey: string;
}

export const useCheckVerificationCodeMutation = () => {
  return useMutation<BaseResponse<boolean>, BaseError, CheckVerificationCodeRequest>({
    mutationFn: async (payload) => {
      const result = await api.post<BaseResponse<boolean>>(
        `/api/v1/auth/validation/confirm-email`,
        payload
      );
      return result.data;
    },
  });
};

export const useDeleteAccountMutation = () => {
  return useMutation<BaseResponse<boolean>, BaseError, undefined>({
    mutationFn: async () => {
      const result = await authApi.post<BaseResponse<boolean>>(`/api/v1/members/delete`);
      return result.data;
    },
  });
};

export const useSendVerificationCodeMutation = () => {
  return useMutation<BaseResponse<string>, BaseError, string>({
    mutationFn: async (email) => {
      const result = await api.post<BaseResponse<string>>(
        '/api/v1/auth/validation/send-email',
        {
          email,
        }
      );
      return result.data;
    },
  });
};

interface SignInRequest {
  userId: string;
  password: string;
  memberType: string;
  complimentaryLogin?: boolean;
}

export const useSignInMutation = () => {
  return useMutation<BaseResponse<UserInfo>, BaseError, SignInRequest>({
    mutationFn: async (payload) => {
      const result = await api.post<BaseResponse<UserInfo>>(
        '/api/v1/auth/login',
        payload
      );
      return result.data;
    },
  });
};

interface SignUpResponse {
  id: number;
  email: string;
  userId: string;
  name: string;
  memberType: string;
}

export const useSignUpMutation = () => {
  return useMutation<BaseResponse<SignUpResponse>, BaseError, SignUpRequest>({
    mutationFn: async (params) => {
      const result = await api.post<BaseResponse<SignUpResponse>>(
        `/api/v1/auth/join`,
        params
      );
      return result.data;
    },
  });
};

interface SocialSignInRequest {
  provider: SocialProvider;
  code: string;
  memberType: string;
  state: string;
  redirectUrl?: string;
  id_token?: string;
  user?: {
    name: { firstName: string; lastName: string };
    email: string;
  };
}

export const useSocialSignInMutation = () => {
  return useMutation<BaseResponse<UserInfo>, BaseError, SocialSignInRequest>({
    mutationFn: async ({ provider, ...payload }) => {
      // 네이버는 토큰 교환에 redirect_uri 를 쓰지 않는다.
      if (provider !== 'naver') {
        Object.assign(payload, { redirectUrl: getRedirectUri(provider) });
      }
      const result = await api.post<BaseResponse<UserInfo>>(
        `/api/v1/auth/access-token/${provider}`,
        payload
      );
      return result.data;
    },
  });
};
