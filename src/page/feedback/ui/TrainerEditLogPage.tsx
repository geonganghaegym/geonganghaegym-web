'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useImages } from '@/entity/image';
import { useEditLogMutation, useLogDetailQuery } from '@/feature/log-class';
import { IconCloseBlack } from '@/shared/assets';
import IconCamera from '@/shared/assets/images/icon_camera.svg';
import IconClose from '@/shared/assets/images/icon_close.svg';
import { Typography } from '@/shared/mixin';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  Textarea,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

interface Props {
  logId: number;
}

const MAX_IMAGES_COUNT = 3;

const TrainerEditLogPage = ({ logId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { errorToast } = useToast();

  const { data } = useLogDetailQuery({ lessonHistoryId: logId });

  const [content, setContent] = useState('');
  const { images, uploadFiles, updateImages } = useImages({ maxCount: MAX_IMAGES_COUNT });

  const { mutate } = useEditLogMutation();

  const submit = () => {
    if (!data || submitButtonDisabled) return;

    mutate(
      {
        logId,
        title: '무제',
        content,
        uploadFiles: images,
      },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({
            queryKey: ['logDetail', logId],
          });
          router.back();
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  useEffect(() => {
    if (data) {
      setContent(data.content);
      updateImages(data.files);
    }
  }, [data]);

  const submitButtonDisabled = !content;

  return (
    <Layout>
      <Layout.Header>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='ghost' className='p-0'>
              <IconClose width={20} height={20} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='py-8'>
            <AlertDialogTitle className={cn(Typography.HEADING_4_BOLD)}>
              수업 일지 수정을 그만둘까요?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn(Typography.BODY_1, 'mt-3 text-gray-600')}>
              변경된 내용은 저장되지 않아요.
            </AlertDialogDescription>
            <AlertDialogFooter className='mt-8 flex flex-row gap-3'>
              <AlertDialogCancel
                onClick={() => router.back()}
                className={cn(
                  Typography.TITLE_1_SEMIBOLD,
                  'flex-center h-full w-full bg-blue-50 py-[13px] text-primary-500'
                )}>
                확인
              </AlertDialogCancel>
              <AlertDialogCancel
                className={cn(
                  Typography.TITLE_1_SEMIBOLD,
                  'flex-center h-full w-full bg-primary-500 py-[13px] text-white'
                )}>
                취소
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className={cn(Typography.HEADING_4, 'flex h-full items-center')}>
          수업 일지 수정
        </p>
        <div className='w-[40px] cursor-default bg-transparent' tabIndex={-1}></div>
      </Layout.Header>
      <Layout.Contents className='p-7'>
        <div className='flex-col space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className={cn(Typography.TITLE_3)}>작성할 수업</h3>
          </div>
          <div className='h-[85px] flex-col space-y-4 rounded-lg border border-gray-200 p-6'>
            {data && (
              <>
                <p className={cn(Typography.TITLE_3, 'text-gray-600')}>{data.lessonDt}</p>
                <div className='space-x-2'>
                  <span className={cn(Typography.TITLE_1_BOLD)}>{data.lessonTime}</span>
                  {data.attendanceStatus === '출석' ? (
                    <span
                      className={cn(
                        Typography.BODY_4_MEDIUM,
                        'select-none rounded-sm bg-blue-50 px-4 py-1 text-primary-500'
                      )}>
                      출석
                    </span>
                  ) : (
                    <span
                      className={cn(
                        Typography.BODY_4_MEDIUM,
                        'select-none rounded-sm bg-gray-100 px-4 py-1 text-gray-700'
                      )}>
                      미출석
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className='mt-10 flex gap-2'>
          <div>
            <Input
              id='image-input'
              type='file'
              multiple
              accept='image/*'
              className='hidden'
              onChange={uploadFiles}
            />
            <label
              htmlFor='image-input'
              className={cn(
                'flex-center h-[60px] w-[60px] cursor-pointer flex-col gap-1 rounded-sm border border-gray-200'
              )}>
              <IconCamera />
              <span className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
                {images.length} / 3
              </span>
            </label>
          </div>
          {images.map((image, index) => (
            <div key={index} className='relative'>
              <Image
                src={`${image.fileUrl}?w=400&q=90`}
                alt={'staged image'}
                width={300}
                height={300}
                className='h-[60px] w-[60px] rounded-sm object-cover'
                priority
              />
              <button
                className='absolute -right-2 -top-2 z-10'
                onClick={() => updateImages(images.filter((_, idx) => index !== idx))}>
                <IconCloseBlack width={20} height={20} />
              </button>
            </div>
          ))}
        </div>
        <div className='mt-8 space-y-3'>
          <h3 className={cn(Typography.TITLE_3)}>내용</h3>
          <Textarea
            placeholder='수업 일지 내용을 작성해 주세요.'
            className={cn(
              Typography.BODY_2,
              'h-[200px] resize-none rounded-lg border border-gray-200 bg-transparent p-6 placeholder:text-gray-500'
            )}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </Layout.Contents>
      <Layout.BottomArea>
        <Button size='full' onClick={submit} disabled={submitButtonDisabled}>
          작성 완료
        </Button>
      </Layout.BottomArea>
    </Layout>
  );
};

export { TrainerEditLogPage };
