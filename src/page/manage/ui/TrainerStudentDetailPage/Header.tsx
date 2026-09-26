import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useDeleteRefundStudentMutation,
  useDeleteStudentMutation,
} from '@/feature/manage';
import { IconBack, IconDotsVertical } from '@/shared/assets';
import IconNoCircleCheck from '@/shared/assets/images/noCircleCheck.svg';
import { Typography } from '@/shared/mixin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  useToast,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import { Layout } from '@/widget';

const Header = ({ name, memberId }: { name: string; memberId: number }) => {
  const router = useRouter();
  const { successToast, errorToast } = useToast();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [checked, setChecked] = useState(false);

  const { mutate } = useDeleteStudentMutation();
  const { mutate: deleteRefundMutate } = useDeleteRefundStudentMutation();

  const changeCheck = () => {
    setChecked((prev) => !prev);
  };

  const deleteStudent = () => {
    mutate(memberId, {
      onSuccess: () => {
        router.replace('/trainer/manage');
      },
      onError: (error) => {
        const message = error?.response?.data.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  const deleteRefundStudent = () => {
    deleteRefundMutate(memberId, {
      onSuccess: ({ message }) => {
        successToast(message);
        router.replace('/trainer/manage');
      },
      onError: (error) => {
        const message = error?.response?.data.message ?? '문제가 발생했습니다.';
        errorToast(message);
      },
    });
  };

  return (
    <Layout.Header>
      <button onClick={() => router.back()}>
        <IconBack />
      </button>
      <h2 className={cn(Typography.HEADING_4_SEMIBOLD, 'layout-header-title text-black')}>
        회원 정보
      </h2>
      <DropdownMenu open={open} onOpenChange={(state) => setOpen(state)}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className={Typography.TITLE_1_SEMIBOLD}>
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='absolute -right-5 top-0 flex w-[130px] flex-col bg-white'>
          <DropdownMenuGroup className='flex flex-col'>
            <DropdownMenuItem className={cn(Typography.TITLE_3, 'px-6 py-5')} asChild>
              <Link href={`/trainer/manage/${memberId}/edit/nickname`}>별칭 설정</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(Typography.TITLE_3, 'px-6 py-5 text-start')}
              onClick={() => setModal(true)}>
              회원 삭제
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(Typography.TITLE_3, 'px-6 py-5 text-start text-point')}
              onClick={() => setSheet(true)}>
              환불 회원 삭제
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={modal} onOpenChange={(state) => setModal(state)}>
        <AlertDialogContent>
          <AlertDialogHeader className='mb-8 text-center'>
            <AlertDialogTitle className={cn(Typography.TITLE_1, 'text-center')}>
              {name}님을 삭제하시겠습니까?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex flex-row gap-3'>
            <AlertDialogCancel
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'mt-0 h-12 w-full rounded-md bg-gray-100 text-gray-600'
              )}>
              아니요
            </AlertDialogCancel>
            <AlertDialogAction
              asChild
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'mt-0 h-12 w-full rounded-md bg-point text-white'
              )}>
              <Button variant='ghost' onClick={deleteStudent}>
                예
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent className='p-7 pb-9'>
          <SheetHeader
            className={cn(Typography.HEADING_4_BOLD, 'mb-7 text-left text-black')}>
            환불 회원 삭제하기
          </SheetHeader>

          <SheetDescription className={cn(Typography.BODY_1, 'mb-10 text-gray-600')}>
            회원 삭제 시 회원 정보, 운동 기록, 예약 내역, 수강권 등은 복구되지 않습니다.
          </SheetDescription>

          <label className='custom-checkbox mb-10 flex items-center'>
            <input
              type='checkbox'
              className='peer hidden'
              checked={checked}
              onChange={changeCheck}
            />
            <span className='flex h-7 w-7 items-center justify-center rounded-sm border border-solid border-gray-300 peer-checked:border-none peer-checked:bg-primary-500'>
              {checked && <IconNoCircleCheck width={15} height={12} fill='white' />}
            </span>
            <p className={cn(Typography.BODY_2, 'ml-3 text-black')}>
              위 내용을 확인하였으며, 회원을 삭제합니다.
            </p>
          </label>

          <SheetFooter className='flex-row justify-between gap-x-3'>
            <SheetClose
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'h-12 w-full rounded-md bg-gray-100 text-gray-600'
              )}>
              취소
            </SheetClose>
            <Button
              className={cn(
                Typography.TITLE_1_SEMIBOLD,
                'h-12 w-full rounded-md text-white',
                checked ? 'bg-point' : 'bg-gray-300'
              )}
              disabled={!checked}
              onClick={deleteRefundStudent}>
              회원 삭제
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Layout.Header>
  );
};

export { Header };
