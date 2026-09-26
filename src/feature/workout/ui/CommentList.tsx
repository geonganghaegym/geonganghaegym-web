'use client';

import Image from 'next/image';
import { Fragment, useState } from 'react';

import { useAuthSelector } from '@/entity/auth';
import { IconDotsVertical, IconProfileDefault } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Button,
  CardFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui';
import { cn } from '@/shared/utils';

import { useWorkoutCommentContext } from '../hook/useComment';
import { WorkoutComment } from '../model/types';

const CommentsWrapper = () => {
  const { comments } = useWorkoutCommentContext();

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <CardFooter>
      <CommentUl comments={comments} />
    </CardFooter>
  );
};

interface CommentUlProps {
  comments: WorkoutComment[];
  depth?: number;
}

const CommentUl = ({ comments, depth = 0 }: CommentUlProps) => {
  return (
    <ul className='flex flex-col'>
      {comments.map((comment) => (
        <Fragment key={comment.id}>
          <CommentLi comment={comment} depth={depth} />
          {comment.replies && comment.replies.length > 0 && (
            <li>
              <CommentUl comments={comment.replies} depth={depth + 1} />
            </li>
          )}
        </Fragment>
      ))}
    </ul>
  );
};

interface CommentLiProps {
  comment: WorkoutComment;
  depth: number;
  className?: string;
}

const CommentLi = ({ comment, depth, className, ...props }: CommentLiProps) => {
  const [opened, setOpened] = useState(false);

  const { target, changeTarget, focusOnInput, deleteComment } =
    useWorkoutCommentContext();
  const { memberId: myMemberId } = useAuthSelector(['memberId']);

  const active = opened || target?.comment.id === comment.id;

  return (
    <li
      className={cn('flex justify-between', active && 'bg-blue-10', className)}
      {...props}>
      <div className={cn('flex space-x-2 px-6 py-4', depth !== 0 && 'ml-[47px]')}>
        {comment.member.fileUrl ? (
          <Image
            src={`${comment.member.fileUrl}?w=300&q=90`}
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
            <p className={cn(Typography.HEADING_5)}>{comment.member.name}</p>
            <p className={cn(Typography.BODY_3, comment.delYn && 'text-gray-500')}>
              {comment.content}
            </p>
          </div>
          {!comment.delYn && depth === 0 && (
            <Button
              variant='ghost'
              size='auto'
              className={cn(Typography.BODY_4_REGULAR, 'z-50 text-gray-500')}
              onPointerDown={(e) => {
                e.stopPropagation();
                changeTarget({
                  comment,
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
      {!comment.delYn && comment.member.memberId === myMemberId && (
        <DropdownMenu
          open={opened}
          onOpenChange={(state) => {
            setOpened(state);
          }}
          modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='mr-6 mt-4'>
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='absolute -right-5 top-0 flex w-[120px] flex-col bg-white p-0'>
            <DropdownMenuGroup className='flex flex-col'>
              <DropdownMenuItem
                className={cn(Typography.TITLE_3, 'px-6 py-5')}
                onClick={() => {
                  changeTarget({
                    comment,
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
                  deleteComment(comment.id);
                  setOpened(false);
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

export { CommentsWrapper };
