import { ChangeEvent, useCallback, useState } from 'react';

import { useToast } from '@/shared/ui';

import { useCreateS3PresignedUrlMutation } from '../api/mutations';
import { ImageType } from '../model/types';
import { useS3UploadImagesMutation } from './../api/mutations';

const MAX_IMAGES_COUNT = 3;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

interface Options {
  maxCount?: number;
}

const useImages = ({ maxCount = MAX_IMAGES_COUNT }: Options = {}) => {
  const { errorToast } = useToast();
  const [images, setImages] = useState<ImageType[]>([]);

  const { mutate: imageMutate } = useCreateS3PresignedUrlMutation();
  const { mutateAsync: s3UploadMutateAsync } = useS3UploadImagesMutation();

  const updateImages = (images: ImageType[]) => {
    setImages(images);
  };

  const uploadFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles) return;
    if (images.length + uploadFiles.length > maxCount) {
      alert(`이미지는 최대 ${maxCount}개까지 업로드할 수 있습니다.`);
      return;
    }

    const fileListArray = Array.from(uploadFiles);

    const hasInvalidFile = fileListArray.some(
      (file) => !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE_BYTES
    );
    if (hasInvalidFile) {
      errorToast('이미지 파일(최대 10MB)만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    const fileNamesArray = fileListArray.map((file) => file.name);
    imageMutate(fileNamesArray, {
      onSuccess: async ({ data }) => {
        e.target.value = '';

        const results = await Promise.allSettled(
          data.map((file, index) =>
            s3UploadMutateAsync({ url: file.fileUrl, file: fileListArray[index] })
          )
        );

        const uploaded: ImageType[] = [];
        let hasFailure = false;

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            uploaded.push({
              fileOrder: data[index].fileOrder,
              fileUrl: data[index].fileUrl.split('?')[0],
            });
          } else {
            hasFailure = true;
          }
        });

        if (uploaded.length > 0) {
          setImages((prev) => [...prev, ...uploaded]);
        }

        if (hasFailure) {
          errorToast('일부 이미지 업로드에 실패했습니다.');
        }
      },
      onError: (error) => {
        errorToast(error?.response?.data.message ?? '에러가 발생했습니다');
      },
    });
  };

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  return { images, uploadFiles, clearImages, updateImages };
};

export { useImages };
