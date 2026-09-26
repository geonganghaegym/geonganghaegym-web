import { useCreateDietCommentMutation } from '@/entity/diet';
import { IconArrowTop } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils';

import { useEditDietCommentMutation } from '../api/mutations';
import { useCommentContext } from '../hooks/useComment';

const CommentInput = () => {
  const {
    dietId,
    ref,
    text,
    changeText,
    clearText,
    target,
    changeTarget,
    refreshComments,
  } = useCommentContext();
  const { mutate: createComment } = useCreateDietCommentMutation(dietId);
  const { mutate: editComment } = useEditDietCommentMutation(dietId);

  // TODO - 리팩토링 필요
  const submitComment = () => {
    // 신규 댓글
    if (target === null) {
      createComment({ content: text }, commentCallback);
    }

    // 신규 대댓글
    if (target && target.mode === 'create' && target.isReply) {
      const parentCommentId = target.comment.parentId ?? target.comment.id;
      createComment({ content: text, parentCommentId }, commentCallback);
    }

    // 댓글, 대댓글 수정
    if (target && target.mode === 'edit') {
      const commentId = target.comment.id;
      editComment({ content: text, commentId }, commentCallback);
    }
  };

  const commentCallback = {
    onSuccess: async () => {
      await refreshComments();
      clearText();
      changeTarget(null);
    },
  };

  return (
    <div
      className={cn(
        'border-t border-gray-200 bg-white px-6 pb-6',
        target === null && 'pt-6'
      )}>
      {/* Input 상단 상태바 - 신규 답글 남기기 */}
      {target !== null && target.mode === 'create' && target.isReply && (
        <div
          className={cn(
            Typography.BODY_4_REGULAR,
            'flex items-center justify-center gap-2 py-4'
          )}>
          {target.comment.member.name}님에게 답글 남기는 중
          <span className='h-[2px] w-[2px] rounded-full bg-gray-500' />
          <Button
            variant='ghost'
            size='auto'
            className={cn(Typography.BODY_4_REGULAR, 'text-gray-500')}
            onClick={() => changeTarget(null)}>
            취소
          </Button>
        </div>
      )}
      {/* Input 상단 상태바 - 기존 댓글, 대댓글 수정하기 */}
      {target !== null && target.mode === 'edit' && (
        <div
          className={cn(
            Typography.BODY_4_REGULAR,
            'flex items-center justify-center gap-2 py-4'
          )}>
          댓글 수정 중
          <span className='h-[2px] w-[2px] rounded-full bg-gray-500' />
          <Button
            variant='ghost'
            size='auto'
            className={cn(Typography.BODY_4_REGULAR, 'text-gray-500')}
            onClick={() => changeTarget(null)}>
            취소
          </Button>
        </div>
      )}

      <div className={cn('flex items-center justify-between space-x-4')}>
        <div className='flex-1 rounded-md border px-6 py-[13px] focus-within:border-primary-500'>
          <textarea
            ref={ref}
            placeholder='댓글을 입력하세요.'
            value={text}
            onChange={changeText}
            className='hide-scrollbar h-8 w-full resize-none appearance-none border-0 align-middle leading-[16px] outline-hidden outline-solid outline-0 ring-0 '
          />
        </div>
        {text && (
          <Button variant='ghost' size='auto' onClick={submitComment}>
            <IconArrowTop />
          </Button>
        )}
      </div>
    </div>
  );
};

export { CommentInput };
