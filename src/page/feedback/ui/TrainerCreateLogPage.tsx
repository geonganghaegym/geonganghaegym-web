'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useImages } from '@/entity/image';
import {
  UnwrittenLesson,
  useCreateLogMutation,
  useLessonListQuery,
} from '@/feature/log-class';
import { IconBack, IconCloseBlack } from '@/shared/assets';
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
  Card,
  Input,
  Textarea,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

interface Props {
  memberId: number;
}

const MAX_IMAGES_COUNT = 3;

const TrainerCreateLogPage = ({ memberId }: Props) => {
  const router = useRouter();
  const { errorToast } = useToast();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const lessonDate = searchParams.get('lessonDate');
  const scheduleId = searchParams.get('scheduleId');
  const { data } = useLessonListQuery({ studentId: memberId, lessonDate });
  const unwrittenLessonList = data
    ? data.filter((item) => item.reviewStatus === '미작성')
    : null;

  const [selectLessonMode, setSelectLessonMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<UnwrittenLesson | null>();
  const [content, setContent] = useState('');
  const { images, uploadFiles, updateImages } = useImages({ maxCount: MAX_IMAGES_COUNT });

  const { mutate } = useCreateLogMutation();

  const submit = () => {
    if (submitButtonDisabled) return;

    mutate(
      {
        title: '무제',
        content,
        studentId: memberId,
        scheduleId: selectedLesson.scheduleId,
        uploadFiles: images,
      },
      {
        onSuccess: () => {
          router.push(`/trainer/manage/${memberId}/log`);
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  const selectLesson = (lesson: UnwrittenLesson) => {
    setSelectedLesson(lesson);
    setSelectLessonMode(false);
  };

  const submitButtonDisabled = !content || !selectedLesson;

  useEffect(() => {
    if (selectedLesson) return;

    if (unwrittenLessonList && unwrittenLessonList.length === 0) {
      setSelectedLesson(null);
    }

    if (unwrittenLessonList && unwrittenLessonList.length > 0) {
      const index = scheduleId
        ? unwrittenLessonList.findIndex((item) => item.scheduleId === Number(scheduleId))
        : 0;
      setSelectedLesson(unwrittenLessonList[index]);
    }
  }, [unwrittenLessonList]);

  if (selectLessonMode) {
    return (
      <Layout>
        <Layout.Header className='relative'>
          <Button
            variant='ghost'
            className='p-0'
            onClick={() => setSelectLessonMode(false)}>
            <IconBack />
          </Button>
          <p className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title')}>
            작성할 수업 선택
          </p>
        </Layout.Header>
        <Layout.Contents className='flex flex-col gap-5 px-7 py-6'>
          {unwrittenLessonList?.map((item) => (
            <button key={item.scheduleId} onClick={() => selectLesson(item)}>
              <Card className='flex w-full flex-col items-start gap-1'>
                <span className={cn(Typography.TITLE_3, 'text-gray-600')}>
                  {item.lessonDt}
                </span>
                <div className='flex flex-row gap-2'>
                  <p className={cn(Typography.TITLE_1_BOLD)}>{item.lessonTime}</p>
                  {item.reservationStatus === '출석' ? (
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
              </Card>
            </button>
          ))}
        </Layout.Contents>
      </Layout>
    );
  }

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
              수업 일지 작성을 그만둘까요?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn(Typography.BODY_1, 'mt-3 text-gray-600')}>
              작성된 내용은 저장되지 않아요.
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
          {`${name ? `${name}님 ` : ''}`}수업 일지 작성
        </p>
        <div className='w-[40px] cursor-default bg-transparent' tabIndex={-1}></div>
      </Layout.Header>
      <Layout.Contents className='p-7'>
        <div className='flex-col space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className={cn(Typography.TITLE_3)}>작성할 수업</h3>
            {selectedLesson !== null && (
              <Button
                variant='ghost'
                size='auto'
                className='text-gray-500'
                onClick={() => setSelectLessonMode(true)}>
                변경하기
              </Button>
            )}
          </div>
          <div className='h-[85px] flex-col space-y-4 rounded-lg border border-gray-200 p-6'>
            {selectedLesson === null && (
              <div
                className={cn(Typography.HEADING_5, 'flex-center h-full text-gray-500')}>
                수업 일지가 모두 작성 완료되었습니다.
              </div>
            )}
            {selectedLesson && selectedLesson !== null && (
              <>
                <p className={cn(Typography.TITLE_3, 'text-gray-600')}>
                  {selectedLesson.lessonDt}
                </p>
                <div className='space-x-2'>
                  <span className={cn(Typography.TITLE_1_BOLD)}>
                    {selectedLesson.lessonTime}
                  </span>
                  {selectedLesson.reservationStatus === '출석' ? (
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
        <div className='mt-10 flex gap-3'>
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
                width={300}
                height={300}
                alt={'staged image'}
                className='h-[60px] w-[60px] rounded-sm object-cover'
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
        <Button
          size='full'
          onClick={submit}
          disabled={submitButtonDisabled}
          className={cn(Typography.TITLE_1_BOLD)}>
          작성 완료
        </Button>
      </Layout.BottomArea>
    </Layout>
  );
};

export { TrainerCreateLogPage };
