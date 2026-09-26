import { ChangeEvent, createContext, useContext, useState } from 'react';

import { DietWithFasting, MealType } from '@/entity/diet';
import {
  ImageType,
  useCreateS3PresignedUrlMutation,
  useS3UploadImagesMutation,
} from '@/entity/image';
import { useToast } from '@/shared/ui';

import { DietImageType } from '../model/types';

type ContextType = ReturnType<typeof useDiet> | null;

const DietContext = createContext<ContextType>(null);

const useDietContext = () => {
  const context = useContext(DietContext);

  if (context === null) {
    throw new Error();
  }

  return context;
};

const dietOrder = ['breakfast', 'lunch', 'dinner'];

const revokeIfBlobUrl = (fileUrl?: string | null) => {
  if (fileUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(fileUrl);
  }
};

const useDiet = () => {
  const { errorToast } = useToast();

  const [images, setImages] = useState<DietImageType[]>([]);

  const { mutate: imageMutate } = useCreateS3PresignedUrlMutation();
  const { mutate: s3UploadMutate } = useS3UploadImagesMutation();

  const setSortedImages = (images: DietImageType[]) => {
    const sortedImages = images.sort(
      (a, b) => dietOrder.indexOf(a.type) - dietOrder.indexOf(b.type)
    );
    setImages(sortedImages);
  };

  //s3 이미지 업로드
  const uploadImageDiet = (e: ChangeEvent<HTMLInputElement>, type: MealType) => {
    const uploadFiles = e.currentTarget.files;
    if (!uploadFiles) return;

    const fileListArray = Array.from(uploadFiles);
    const fileNamesArray = fileListArray.map((file) => file.name);

    const imageUrls = fileListArray.map((file) => URL.createObjectURL(file));
    const newPreviewImages = imageUrls.map((fileUrl) => ({ fileUrl, type, fast: false }));

    setImages((prevImages) => {
      const filteredImages = prevImages.filter((image) => image.type !== type);
      const replacedImage = prevImages.find((image) => image.type === type);
      revokeIfBlobUrl(replacedImage?.fileUrl);
      const newImages = [...filteredImages, ...newPreviewImages];
      setSortedImages(newImages);
      return newImages;
    });

    imageMutate(fileNamesArray, {
      onSuccess: ({ data }) => {
        const image: ImageType[] = [
          {
            fileUrl: data[0].fileUrl.split('?')[0],
            fileOrder: data[0].fileOrder,
          },
        ];
        s3UploadMutate(
          { url: data[0].fileUrl, file: uploadFiles[0] },
          {
            onSuccess: () => {
              const imagesWithType = image.map((image: ImageType) => ({
                ...image,
                type,
                fast: false,
              }));

              setImages((prev) => {
                const filteredImages = prev.filter((image) => image.type !== type);
                const previewImage = prev.find((image) => image.type === type);
                revokeIfBlobUrl(previewImage?.fileUrl);

                const newImages = [...filteredImages, ...imagesWithType];
                setSortedImages(newImages);
                return newImages;
              });
            },
          }
        );
      },
      onError: (error) => {
        errorToast(error?.response?.data.message ?? '에러가 발생했습니다');
      },
    });
  };

  //단식 체크
  const onClickCheckFasting = (type: MealType) => {
    setImages((prev) => {
      const newImages = prev.map((image) => {
        if (image.type === type) {
          revokeIfBlobUrl(image.fileUrl);
          return { ...image, fileUrl: null, fast: true };
        }
        return image;
      });
      setSortedImages(newImages);
      return newImages;
    });
  };

  //단식해제
  const onClickCancelFasting = (type: MealType) => {
    setImages((prev) => {
      const newImages = prev.map((image) => {
        if (image.type === type) {
          revokeIfBlobUrl(image.fileUrl);
          return { ...image, fileUrl: null, fast: false };
        }
        return image;
      });
      setSortedImages(newImages);
      return newImages;
    });
  };

  const clearImages = (type: MealType) => {
    if (images.length > 0) {
      const res = images.map((image) => {
        if (image.type === type) {
          revokeIfBlobUrl(image.fileUrl);
          return { ...image, fileUrl: null };
        }
        return image;
      });
      setSortedImages(res);
    }
  };

  interface InitialImagesProps {
    breakfast: DietWithFasting;
    lunch: DietWithFasting;
    dinner: DietWithFasting;
  }

  const createDietImage = (
    mealType: MealType,
    mealData: DietWithFasting
  ): DietImageType => {
    return {
      fast: mealData?.fast,
      fileOrder: 1,
      fileUrl: mealData?.dietFile ? mealData.dietFile.fileUrl : null,
      type: mealType,
    };
  };

  const initialImages = (data?: InitialImagesProps) => {
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
    const defaultSetting: DietImageType[] = [
      {
        fast: false,
        fileOrder: 1,
        fileUrl: null,
        type: 'breakfast',
      },
      {
        fast: false,
        fileOrder: 1,
        fileUrl: null,
        type: 'lunch',
      },
      {
        fast: false,
        fileOrder: 1,
        fileUrl: null,
        type: 'dinner',
      },
    ];

    if (!data) setSortedImages(defaultSetting);

    if (data) {
      const res = mealTypes.map((mealType) => {
        return createDietImage(mealType, data[mealType]);
      });
      setSortedImages(res);
    }
  };

  return {
    images,
    setImages: setSortedImages,
    uploadImageDiet,
    onClickCheckFasting,
    onClickCancelFasting,
    clearImages,
    initialImages,
  };
};

export { DietContext, useDiet, useDietContext };
