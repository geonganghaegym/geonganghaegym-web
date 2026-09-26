'use client';

import { useSearchParams } from 'next/navigation';
import {
  Dispatch,
  FormEvent,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';

import {
  EMAIL_REGEXP,
  EXCLUDE_SPACE_REGEXP,
  ID_REGEXP,
  NAME_REGEXP,
  SignUpFormType,
  useCheckVailableIdMutation,
  useCheckVerificationCodeMutation,
  useSendVerificationCodeMutation,
} from '@/entity/auth';
import { IconSendEmail } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, useToast } from '@/shared/ui';
import { cn } from '@/shared/utils';

import { useInvitationInfoQuery } from '../../api/queries';
import { FunnelProps, StepProps } from '../../hooks/useSignUpFunnel';
import { SetupEmail } from './SetupEmail';
import { SetupEmailVerificationCode } from './SetupEmailVerificationCode';
import { SetupId } from './SetupId';
import { SetupName } from './SetupName';
import { SetupPassword } from './SetupPassword';

interface Props {
  step: number;
  Step: FunctionComponent<StepProps>;
  Funnel: FunctionComponent<FunnelProps>;
  setStep: Dispatch<SetStateAction<number>>;
  isIdVerified: boolean;
  setIsIdVerified: Dispatch<SetStateAction<boolean>>;
  isEmailVerified: boolean;
  setIsEmailVerified: Dispatch<SetStateAction<boolean>>;
}
export const SignUpFunnel = ({
  step,
  Step,
  Funnel,
  setStep,
  isIdVerified,
  setIsIdVerified,
  isEmailVerified,
  setIsEmailVerified,
}: Props) => {
  const searchParams = useSearchParams();
  const uuid = searchParams?.get('uuid');
  const { toast } = useToast();

  const [idSuccessMsg, setIdSuccessMsg] = useState('');

  const {
    watch,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignUpFormType>();
  const { data } = useInvitationInfoQuery(uuid ?? '');

  const { mutate: sendVerificationCodeMutate, isPending: sendVerificationCodePending } =
    useSendVerificationCodeMutation();
  const { mutate: checkVerificationCodeMutate, isPending: checkVerificationCodePending } =
    useCheckVerificationCodeMutation();
  const { mutate: checkAvailableIdMutate, isPending: checkVailableIdPending } =
    useCheckVailableIdMutation();

  const nameValue = data ? data.name : watch('name');
  const emailValue = watch('email');
  const verificationCodeValue = watch('emailVerifiedCode');
  const userIdValue = watch('userId');
  const passwordValue = watch('password');
  const passwordConfirmValue = watch('passwordConfirm');

  const clickNextStep = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIdSuccessMsg('');
    setStep((prev) => prev + 1);
  };

  useEffect(() => {
    clearErrors('userId');

    if (isIdVerified) {
      setIsIdVerified(false);
      setIdSuccessMsg('');
    }
  }, [userIdValue]);

  const isNextButtonDisabled = () => {
    switch (step) {
      case 1:
        return !nameValue || nameValue?.length < 2 || !NAME_REGEXP.test(nameValue);
      case 2:
        return (!emailValue && !isEmailVerified) || !EMAIL_REGEXP.test(emailValue);
      case 3:
        return (
          verificationCodeValue?.length !== 6 ||
          !EXCLUDE_SPACE_REGEXP.test(verificationCodeValue)
        );
      case 4:
        return !isIdVerified;
      case 5:
        return passwordValue?.length < 8 || passwordConfirmValue?.length < 8;
      default:
        return false;
    }
  };

  //이메일 인증코드 발송
  const handleSendVerificationCode = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setValue('emailVerifiedCode', '');

    if (!EMAIL_REGEXP.test(emailValue))
      return setError('email', { message: '이메일 형식이 아닙니다' });

    sendVerificationCodeMutate(emailValue, {
      onSuccess: ({ message }) => {
        toast({
          className: 'h-12',
          description: (
            <div className='flex items-center justify-center'>
              <IconSendEmail />
              <p className={cn(Typography.HEADING_5, 'ml-6 text-white')}>{message}</p>
            </div>
          ),
          duration: 2000,
        });
        if (step < 3) {
          setStep((prev) => prev + 1);
        }
      },
      onError: (error) => {
        setError('email', { message: `${error?.response?.data.message}` });
      },
    });
  };

  //인증번호 입력
  const handleCheckVerificationCode = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    checkVerificationCodeMutate(
      {
        email: emailValue,
        emailKey: verificationCodeValue,
      },
      {
        onSuccess: () => {
          setIsEmailVerified(true);
          clearErrors('emailVerifiedCode');
          setStep((prev) => prev + 1);
        },
        onError: (error) => {
          setError('emailVerifiedCode', { message: `${error.response?.data.message}` });
        },
      }
    );
  };

  //아이디 중복 확인
  const handleIsIdAvailable = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIdSuccessMsg('');
    if (!(userIdValue && ID_REGEXP.test(userIdValue))) {
      return setError('userId', {
        message: '아이디는 소문자, 대문자, 숫자만 입력할 수 있습니다',
      });
    }

    checkAvailableIdMutate(userIdValue, {
      onSuccess: ({ message }) => {
        setIsIdVerified(true);
        setIdSuccessMsg(message);
      },

      onError: (error) => {
        setError('userId', { message: `${error.response?.data.message}` });
      },
    });
  };

  return (
    <div className='flex h-full flex-col justify-between  pt-[38px]'>
      <div className='w-full overflow-auto'>
        <h3 className={cn(Typography.HEADING_1, 'mb-[63px] text-center')}>
          {step === 1 && '이름을 입력해주세요.'}
          {step === 2 && '이메일을 입력해주세요.'}
          {step === 3 && (
            <>
              이메일로 발송된 <br />
              인증번호를 입력해주세요.
            </>
          )}
          {step === 4 && '아이디를 설정해주세요.'}
          {step === 5 && '비밀번호를 설정해주세요.'}
        </h3>

        <div className='px-7'>
          <Funnel step={step}>
            <Step id={5}>
              <SetupPassword />
            </Step>

            <Step id={4}>
              <SetupId
                idSuccessMsg={idSuccessMsg}
                isPending={checkVailableIdPending}
                handleIsIdAvailable={handleIsIdAvailable}
              />
            </Step>

            <Step id={3}>
              <SetupEmailVerificationCode
                step={step}
                isEmailVerified={isEmailVerified}
                isPending={sendVerificationCodePending}
                handleSendVerificationCode={handleSendVerificationCode}
              />
            </Step>

            <Step id={2}>
              <SetupEmail step={step} isEmailVerified={isEmailVerified} />
            </Step>

            <Step id={1}>
              <SetupName />
            </Step>
          </Funnel>
        </div>
      </div>

      <div className='w-full p-7'>
        {step < 5 ? (
          step === 2 ? (
            <Button
              className={cn(Typography.TITLE_1, 'h-[57px] w-full rounded-lg')}
              type='button'
              onClick={handleSendVerificationCode}
              disabled={isNextButtonDisabled() || sendVerificationCodePending}>
              인증번호 발송
            </Button>
          ) : step === 3 ? (
            <Button
              className={cn(Typography.TITLE_1, 'h-[57px] w-full rounded-lg')}
              type='button'
              onClick={handleCheckVerificationCode}
              disabled={
                isNextButtonDisabled() ||
                checkVerificationCodePending ||
                Boolean(errors.emailVerifiedCode)
              }>
              인증 완료
            </Button>
          ) : (
            <Button
              className={cn(Typography.TITLE_1, 'h-[57px] w-full rounded-lg')}
              type='button'
              onClick={clickNextStep}
              disabled={isNextButtonDisabled()}>
              다음
            </Button>
          )
        ) : (
          <Button
            className={cn(Typography.TITLE_1, 'h-[57px] w-full rounded-lg')}
            type='submit'
            form='submitSignUp'
            disabled={isNextButtonDisabled()}>
            완료
          </Button>
        )}
      </div>
    </div>
  );
};
