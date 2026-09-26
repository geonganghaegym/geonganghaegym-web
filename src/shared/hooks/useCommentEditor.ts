import { useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, MutableRefObject, useCallback, useState } from 'react';

type CommentTarget<T> = {
  comment: T;
  isReply: boolean;
  mode: 'create' | 'edit';
} | null;

interface Props {
  queryKey: unknown[];
  ref: MutableRefObject<HTMLTextAreaElement | null>;
}

// 댓글/답글 입력창 상태 + 대상(target) 전환 로직. log-class·log-diet 댓글 훅이 공유한다.
const useCommentEditor = <T extends { content: string }>({ queryKey, ref }: Props) => {
  const queryClient = useQueryClient();

  const [text, setText] = useState('');
  const [target, setTarget] = useState<CommentTarget<T>>(null);

  const refreshComments = async () => {
    await queryClient.refetchQueries({ queryKey });
  };

  const changeText = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const clearText = useCallback(() => {
    setText('');
  }, []);

  const focusOnInput = useCallback(() => {
    ref?.current?.focus();
  }, [ref]);

  const changeTarget = useCallback(
    (target: CommentTarget<T>) => {
      target?.mode === 'create' ? clearText() : setText(target?.comment.content ?? '');

      setTarget(target);
      focusOnInput();
    },
    [clearText, focusOnInput]
  );

  return {
    ref,
    target,
    text,
    changeText,
    clearText,
    focusOnInput,
    changeTarget,
    refreshComments,
  };
};

export { useCommentEditor };
export type { CommentTarget };
