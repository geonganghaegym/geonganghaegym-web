'use client';

import Image from 'next/image';
import { Fragment, PropsWithChildren, useState } from 'react';

import { useAuthSelector } from '@/entity/auth';
import { useDeleteDietCommentMutation } from '@/entity/diet';
import { IconDotsVertical, IconProfileDefault } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/utils';

import { useCommentContext } from '../hooks/useComment';
import type { ContentType } from '../model/types';

type Props = PropsWithChildren<{
  comments: ContentType[] | [];
  depth?: number;
  dietId: number;
}>;

const CommentList = ({ comments, dietId, depth = 0 }: Props) => {
  return (
    comments.length > 0 &&
    comments !== null && (
      <ul className={cn('flex-col')}>
        {comments.map((comment: ContentType) => (
          <Fragment key={comment.id}>
            <CommentItem dietId={dietId} commentItem={comment} depth={depth} />
            {comment.replies && comment.replies.length > 0 && (
              <li>
                <CommentList
                  comments={comment.replies}
                  dietId={dietId}
                  depth={depth + 1}
                />
              </li>
            )}
          </Fragment>
        ))}
      </ul>
    )
  );
};

const CommentItem = ({
  commentItem,
  depth,
  dietId,
  className,
  ...props
}: {
  commentItem: ContentType;
  depth: number;
  dietId: number;
  className?: string;
}) => {
  const [opend, setOpend] = useState(false);

  const { memberId } = useAuthSelector(['memberId']);
  const { target, changeTarget, focusOnInput, refreshComments } = useCommentContext();
  const { mutate } = useDeleteDietCommentMutation();

  const active = opend || target?.comment.id === commentItem.id;

  const deleteComment = (commentId: number) => {
    mutate(
      { commentId, dietId },
      {
        onSuccess: async () => {
          await refreshComments();
        },
      }
    );
  };

  return (
    <li
      className={cn('flex justify-between', active && 'bg-blue-10', className)}
      {...props}>
      <div className={cn('flex space-x-2 px-6 py-4', depth !== 0 && 'ml-[47px]')}>
        {commentItem.member.fileUrl ? (
          <Image
            src={`${commentItem.member.fileUrl}?w=300&h=300&q=90`}
            width={80}
            height={80}
            alt='staged image'
            className={cn('aspect-square h-8 w-8 rounded-full object-cover')}
            priority
          />
        ) : (
          <IconProfileDefault width={24} height={24} />
        )}
        <div className='flex-col'>
          <div className='flex-col'>
            <p className={cn(Typography.HEADING_5, 'text-black')}>
              {commentItem.member.name}
            </p>
            <p
              className={cn(
                Typography.BODY_3,
                'mb-3 text-black',
                commentItem.delYn && 'text-gray-500'
              )}>
              {commentItem.content}
            </p>
          </div>
          {!commentItem.delYn && depth === 0 && (
            <Button
              variant='ghost'
              size='auto'
              className={cn(Typography.BODY_4_REGULAR, 'z-50 text-gray-500')}
              onPointerDown={(e) => {
                e.stopPropagation();
                changeTarget({
                  comment: commentItem,
                  isReply: true,
                  mode: 'create',
                });
              }}
              onClick={() => {
                focusOnInput();
              }}>
              답글 달기
            </Button>
          )}
        </div>
      </div>
      {!commentItem.delYn && commentItem.member.memberId === memberId && (
        <DropdownMenu
          open={opend}
          onOpenChange={(state) => {
            setOpend(state);
          }}
          modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='mr-6 mt-4'>
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='absolute -top-11 right-4 flex w-[120px] flex-col bg-white'>
            <DropdownMenuGroup className='flex flex-col'>
              <DropdownMenuItem
                className={cn(Typography.TITLE_3, 'px-6 py-5')}
                onClick={() => {
                  changeTarget({
                    comment: commentItem,
                    isReply: false,
                    mode: 'edit',
                  });
                  focusOnInput();
                }}>
                댓글 수정
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(Typography.TITLE_3, 'px-6 py-5')}
                onClick={() => {
                  deleteComment(commentItem.id);
                  setOpend(false);
                }}>
                댓글 삭제
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
};

export { CommentList };
