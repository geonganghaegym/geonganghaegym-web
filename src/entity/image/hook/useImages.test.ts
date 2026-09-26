import { act, renderHook, waitFor } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useToast } from '@/shared/ui';

import {
  useCreateS3PresignedUrlMutation,
  useS3UploadImagesMutation,
} from '../api/mutations';
import { useImages } from './useImages';

// jest.mock() resolves its own path argument via jest-resolve, which doesn't
// understand the '@/*' tsconfig alias (only next/jest's SWC transform does) — so
// the alias has to be mocked via its real relative path instead.
jest.mock('../../../shared/ui', () => ({
  useToast: jest.fn(),
}));
jest.mock('../api/mutations', () => ({
  useCreateS3PresignedUrlMutation: jest.fn(),
  useS3UploadImagesMutation: jest.fn(),
}));

const mockedUseToast = jest.mocked(useToast);
const mockedUseCreateS3PresignedUrlMutation = jest.mocked(
  useCreateS3PresignedUrlMutation
);
const mockedUseS3UploadImagesMutation = jest.mocked(useS3UploadImagesMutation);

const createImageFile = (name: string) =>
  new File(['content'], name, { type: 'image/png' });

const buildChangeEvent = (files: File[]) => {
  const target = { files: files as unknown as FileList, value: 'x' };
  return { target } as unknown as ChangeEvent<HTMLInputElement>;
};

describe('useImages.uploadFiles', () => {
  const errorToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseToast.mockReturnValue({ errorToast } as unknown as ReturnType<
      typeof useToast
    >);

    mockedUseCreateS3PresignedUrlMutation.mockReturnValue({
      mutate: (fileNames: string[], options: { onSuccess: (res: unknown) => void }) => {
        options.onSuccess({
          data: fileNames.map((_, index) => ({
            fileOrder: index,
            fileUrl: `https://s3.example.com/${index}?signed`,
          })),
        });
      },
    } as unknown as ReturnType<typeof useCreateS3PresignedUrlMutation>);
  });

  it('일부 S3 업로드가 실패하면 성공한 파일만 반영하고 에러 토스트를 띄운다', async () => {
    const mutateAsync = jest
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('upload failed'));
    mockedUseS3UploadImagesMutation.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useS3UploadImagesMutation>);

    const { result } = renderHook(() => useImages());

    act(() => {
      result.current.uploadFiles(
        buildChangeEvent([createImageFile('a.png'), createImageFile('b.png')])
      );
    });

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledWith('일부 이미지 업로드에 실패했습니다.');
    });

    expect(result.current.images).toEqual([
      { fileOrder: 0, fileUrl: 'https://s3.example.com/0' },
    ]);
  });
});
