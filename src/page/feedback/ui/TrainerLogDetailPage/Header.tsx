import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useDeleteLogMutation, useLogTrainerCommentContext } from '@/feature/log-class';
import { IconBack, IconDotsVertical, IconEdit, IconTrash } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const Header = () => {
  const router = useRouter();
  const { successToast, errorToast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { logId, memberId } = useLogTrainerCommentContext();
  const { mutate } = useDeleteLogMutation();

  const deleteLog = () => {
    mutate(
      { logId },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({ queryKey: ['studentLogList', memberId] });
          successToast('수업 일지가 삭제되었습니다.');
          router.replace(`/trainer/manage/${memberId}/log`);
        },
        onError: (error) => {
          const message = error?.response?.data.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  return (
    <Layout.Header>
      <button onClick={() => router.back()}>
        <IconBack />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(Typography.TITLE_1_SEMIBOLD, 'flex-center w-6')}>
          <IconDotsVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='absolute -right-5 top-0 flex w-[120px] flex-col bg-white'>
          <DropdownMenuGroup className='flex flex-col'>
            <DropdownMenuItem
              className={cn(Typography.TITLE_3, 'flex items-center gap-3 px-6 py-5')}
              onClick={() =>
                router.replace(`/trainer/manage/${memberId}/log/${logId}/edit`)
              }>
              <IconEdit />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                Typography.TITLE_3,
                'flex items-center gap-3 px-6 py-5 text-point'
              )}
              onClick={() => setOpen(true)}>
              <IconTrash />
              삭제
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader
            className={cn(Typography.TITLE_1_SEMIBOLD, 'mb-8 text-center')}>
            게시글을 삭제하시겠습니까?
          </AlertDialogHeader>
          <AlertDialogFooter className='grid w-full grid-cols-2 items-center justify-center gap-3'>
            <AlertDialogCancel className='mt-0 h-12 rounded-md bg-gray-100 text-base font-normal text-gray-600'>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              asChild
              className='mt-0 h-12 rounded-md bg-point text-base font-normal text-white'>
              <Button variant='ghost' onClick={deleteLog}>
                삭제
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout.Header>
  );
};

export { Header };
