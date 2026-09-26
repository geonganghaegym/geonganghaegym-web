import { createContext, MutableRefObject, useContext } from 'react';

import { useCommentEditor } from '@/shared/hooks';

import { Comment } from '../model/types';

type ContextType = ReturnType<typeof useTrainerComment> | null;

const TrainerCommentContext = createContext<ContextType>(null);

const useTrainerCommentContext = () => {
  const context = useContext(TrainerCommentContext);

  if (context === null) {
    throw new Error();
  }

  return context;
};

interface Props {
  memberId: number;
  logId: number;
  ref: MutableRefObject<HTMLTextAreaElement | null>;
}

const useTrainerComment = ({ memberId, logId, ref }: Props) => {
  const comment = useCommentEditor<Comment>({ ref, queryKey: ['logDetail', logId] });

  return { memberId, logId, ...comment };
};

export { TrainerCommentContext, useTrainerComment, useTrainerCommentContext };
