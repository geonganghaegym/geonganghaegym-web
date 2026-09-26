import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import {
  COMPLIMENTARY_STUDENT_USER_ID,
  COMPLIMENTARY_TRAINER_USER_ID,
  useAuthAction,
  useSignInMutation,
} from '@/entity/auth';
import { Typography } from '@/shared/mixin';
import { Button, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';

const EXPERIMENT_TRAINER_PASSWORD = '12345678a';
const EXPERIMENT_STUDENT_PASSWORD = '12345678a';

interface Props {
  memberType: string;
  className?: string;
  children?: ReactNode;
}

const ComplimentaryButton = ({ memberType, className, children = '체험하기' }: Props) => {
  const router = useRouter();
  const { mutate } = useSignInMutation();
  const { setUserInfo } = useAuthAction();
  const { errorToast } = useToast();

  const onClick = () => {
    const userId =
      memberType === 'trainer'
        ? COMPLIMENTARY_TRAINER_USER_ID
        : COMPLIMENTARY_STUDENT_USER_ID;
    const password =
      memberType === 'trainer'
        ? EXPERIMENT_TRAINER_PASSWORD
        : EXPERIMENT_STUDENT_PASSWORD;

    mutate(
      {
        userId,
        password,
        memberType: memberType.toUpperCase(),
        complimentaryLogin: true,
      },
      {
        onSuccess: ({ data }) => {
          // 체험 계정은 여러 기기가 공유하므로 앱에 memberId를 넘겨 FCM 토큰을 등록하지 않는다
          setUserInfo(data);
          router.replace(`/${data.memberType?.toLowerCase()}`);
        },
        onError: (error) => {
          const message = error.response?.data?.message ?? '문제가 발생했습니다.';
          errorToast(message);
        },
      }
    );
  };

  return (
    <Button
      variant='link'
      className={cn(
        Typography.TITLE_3,
        'mt-5 text-gray-500 hover:no-underline',
        className
      )}
      onClick={onClick}>
      {children}
    </Button>
  );
};

export { ComplimentaryButton };
