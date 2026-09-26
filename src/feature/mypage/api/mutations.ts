import { useMutation } from '@tanstack/react-query';

import { auth, authApi } from '@/entity/auth';
import { BaseError, BaseResponse } from '@/shared/api';
import {
  resumeNativePushRegistration,
  suspendNativePushRegistration,
} from '@/shared/lib/native-push';

interface ChangeEmailRequest {
  email: string;
  emailKey: string;
}

export const useChangeEmailMutation = () => {
  return useMutation<BaseResponse<boolean>, BaseError, ChangeEmailRequest>({
    mutationFn: async (payload) => {
      const result = await authApi.patch<BaseResponse<boolean>>(
        '/api/v1/members/email',
        payload
      );
      return result.data;
    },
  });
};

export const useChangeMyNameMutation = () => {
  return useMutation<BaseResponse<string>, BaseError, string>({
    mutationFn: async (name) => {
      const result = await authApi.patch<BaseResponse<string>>(`/api/v1/members/name`, {
        name,
      });
      return result.data;
    },
  });
};

interface ChangePasswordRequest {
  changePassword1: string;
  changePassword2: string;
}

export const useChangePasswordMutation = () => {
  return useMutation<BaseResponse<boolean>, BaseError, ChangePasswordRequest>({
    mutationFn: async (payload) => {
      const result = await authApi.patch<BaseResponse<boolean>>(
        '/api/v1/members/password',
        payload
      );
      return result.data;
    },
  });
};

export const useDeleteProfileImageMutation = () => {
  return useMutation<BaseResponse<undefined>, BaseError>({
    mutationFn: async () => {
      const result = await authApi.delete<BaseResponse<undefined>>(
        `/api/v1/members/profile`
      );
      return result.data;
    },
  });
};

export const useLogOutMutation = () => {
  return useMutation<BaseResponse<boolean>, BaseError, undefined>({
    mutationFn: async () => {
      await suspendNativePushRegistration();
      try {
        // 이 브라우저의 FCM 토큰만 지우도록 함께 보낸다. 없으면 서버가 회원의 모든 기기 토큰을 지운다
        const fcmToken = localStorage.getItem('serviceWorkerRegistration') ?? undefined;
        // 이 기기의 갱신 토큰만 폐기한다. 같은 계정으로 로그인한 다른 기기는 로그인이 유지된다
        const refreshToken = auth().tokens?.refreshToken;
        const result = await authApi.post<BaseResponse<boolean>>(`/api/v1/members/logout`, {
          fcmToken,
          refreshToken,
        });
        return result.data;
      } catch (error) {
        resumeNativePushRegistration();
        throw error;
      }
    },
  });
};

interface SetProfileImageRequest {
  file: File;
}

interface SetProfileImageResponse {
  fileUrl: string;
  fileName: string;
}

export const useSetProfileImageMutation = () => {
  return useMutation<
    BaseResponse<SetProfileImageResponse>,
    BaseError,
    SetProfileImageRequest
  >({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await authApi.put<BaseResponse<SetProfileImageResponse>>(
        '/api/v1/members/profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return result.data;
    },
  });
};

export const useVerifyPasswordMutation = () => {
  return useMutation<BaseResponse<boolean>, BaseError, string>({
    mutationFn: async (password) => {
      const result = await authApi.post<BaseResponse<boolean>>(
        '/api/v1/members/password',
        {
          password,
        }
      );
      return result.data;
    },
  });
};
