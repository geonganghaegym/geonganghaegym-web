import { createContext, MutableRefObject, useContext } from 'react';

import { useCommentEditor } from '@/shared/hooks';

import { Comment } from '../model/types';

type ContextType = ReturnType<typeof useStudentComment> | null;

const StudentCommentContext = createContext<ContextType>(null);

const useStudentCommentContext = () => {
  const context = useContext(StudentCommentContext);

  if (context === null) {
    throw new Error();
  }

  return context;
};

interface Props {
  logId: number;
  ref: MutableRefObject<HTMLTextAreaElement | null>;
}

const useStudentComment = ({ logId, ref }: Props) => {
  const comment = useCommentEditor<Comment>({ ref, queryKey: ['logDetail', logId] });

  return { logId, ...comment };
};

export { StudentCommentContext, useStudentComment, useStudentCommentContext };
