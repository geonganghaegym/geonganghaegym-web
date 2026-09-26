import { createContext, MutableRefObject, useContext } from 'react';

import { useCommentEditor } from '@/shared/hooks';

import { ContentType } from '../model/types';

type ContextType = ReturnType<typeof useComment> | null;

const CommentContext = createContext<ContextType>(null);

const useCommentContext = () => {
  const context = useContext(CommentContext);

  if (context === null) {
    throw new Error();
  }

  return context;
};

interface Props {
  dietId: number;
  ref: MutableRefObject<HTMLTextAreaElement | null>;
}

const useComment = ({ dietId, ref }: Props) => {
  const comment = useCommentEditor<ContentType>({
    ref,
    queryKey: ['dietCommentList', dietId],
  });

  return { dietId, ...comment };
};

export { CommentContext, useComment, useCommentContext };
