import { getSocialAuthUrl } from '@/entity/auth';
import { IconAppleLogo, IconKakaoLogo, IconNaverLogo } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button } from '@/shared/ui';
import { cn, generateUUID } from '@/shared/utils';

interface Props {
  memberType: 'trainer' | 'student';
  uuid?: string;
}

export const SocialSignIn = ({ memberType, uuid }: Props) => {
  const generateClientState = () => {
    const state = generateUUID();
    localStorage.setItem(
      state,
      JSON.stringify({
        memberType,
        ...(uuid && { uuid }),
      })
    );
    return state;
  };

  return (
    <div className={cn(Typography.TITLE_2, ' flex w-full flex-col gap-y-4')}>
      <Button
        className='h-12 gap-x-2 rounded-xl bg-[#FEE500] p-4 text-black'
        onClick={() => {
          window.location.href = `${getSocialAuthUrl('kakao')}&state=${generateClientState()}`;
        }}>
        <IconKakaoLogo />
        카카오로 시작하기
      </Button>
      <Button
        className='h-12 gap-x-2 rounded-xl bg-[#03C75A] p-4 text-white'
        onClick={() => {
          window.location.href = `${getSocialAuthUrl('naver')}&state=${generateClientState()}`;
        }}>
        <IconNaverLogo />
        네이버로 시작하기
      </Button>
      <Button
        className='h-12 gap-x-2 rounded-xl bg-black p-4 text-white'
        onClick={() => {
          window.location.href = `${getSocialAuthUrl('apple')}&state=${generateClientState()}`;
        }}>
        <IconAppleLogo />
        애플로 시작하기
      </Button>
      {/* <Button
        className='h-12 gap-x-2 rounded-xl border border-gray-600 bg-white p-4 text-gray-600'
        onClick={() => {
          window.location.href = `${getSocialAuthUrl('google')}&state=${generateClientState()}`;
        }}>
        <IconGoogleLogo />
        Google로 시작하기
      </Button> */}
    </div>
  );
};
