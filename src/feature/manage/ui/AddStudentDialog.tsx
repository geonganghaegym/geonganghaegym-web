import Link from 'next/link';

import { IconPeoplePlus, IconPeoples, IconPlus } from '@/shared/assets';
import CloseIcon from '@/shared/assets/images/icon_close.svg';
import { Typography } from '@/shared/mixin';
import { Button, Layout } from '@/shared/ui';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/shared/ui/dialog';
import { cn } from '@/shared/utils';

export const AddStudentDialog = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant='ghost' className='h-7 w-7' size='icon'>
            <IconPlus fill='black' width={17} height={16} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='top-0 max-w-(--max-width) translate-y-0 p-0'>
        <Layout.Header className='flex-row-reverse'>
          <DialogClose asChild>
            <Button
              variant='outline'
              className='border-none bg-transparent p-0 hover:bg-transparent'>
              <CloseIcon width={20} height={20} />
            </Button>
          </DialogClose>
          <h1 className={cn(Typography.HEADING_4)}>회원 추가</h1>
          <div className='w-[40px] cursor-default bg-transparent' tabIndex={-1}></div>
        </Layout.Header>
        <Layout.Contents className='flex w-full flex-row items-center justify-evenly py-6'>
          <Link
            href={'/trainer/manage/invite'}
            className='flex w-full flex-col items-center justify-center gap-y-2'>
            <IconPeoplePlus />
            <p className={cn(Typography.HEADING_5)}>회원 직접 추가</p>
          </Link>
          <Link
            href={'/trainer/manage/append'}
            className='flex w-full flex-col items-center justify-center gap-y-2'>
            <IconPeoples />
            <p className={cn(Typography.HEADING_5)}>가입된 회원 추가</p>
          </Link>
        </Layout.Contents>
      </DialogContent>
    </Dialog>
  );
};
