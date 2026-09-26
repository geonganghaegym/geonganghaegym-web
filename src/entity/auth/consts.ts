import { SocialProvider } from './model/types';

// 같은 배포가 세 호스트로 서비스된다. OAuth state·토큰이 origin별 localStorage에 있으므로
// 로그인을 시작한 origin으로 콜백을 받아야 한다. 백엔드 허용 목록(OAuthProperties)과 맞춘다.
const ALLOWED_ORIGINS = [
  'https://geonganghaejim.site',
  'https://health.junghaebom.com',
  'https://geonganghaegym.junghaebom.com',
];

const resolveBaseUri = (origin?: string) =>
  (origin && ALLOWED_ORIGINS.includes(origin) ? origin : undefined) ??
  process.env.NEXT_PUBLIC_WEB_URI ??
  origin ??
  '';

// 모듈 평가 시점(SSR)에 고정되지 않도록 호출 시점에 브라우저 origin을 읽는다.
const getBaseRedirectUri = () =>
  resolveBaseUri(typeof window !== 'undefined' ? window.location.origin : undefined);

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

// 애플은 form_post 라 API 라우트(/api/callback/apple)가 받아 /apple/callback 으로 넘긴다.
const getRedirectUri = (provider: SocialProvider) =>
  provider === 'apple'
    ? `${getBaseRedirectUri()}/api/callback/apple`
    : `${getBaseRedirectUri()}/${provider}/callback`;

const getSocialAuthUrl = (provider: SocialProvider) => {
  const redirectUri = getRedirectUri(provider);
  switch (provider) {
    case 'kakao':
      return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
    case 'naver':
      return `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    case 'apple':
      return `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code id_token&scope=name email&response_mode=form_post`;
  }
};

// 체험하기로 로그인하는 공유 계정. 백엔드 COMPLIMENTARY_ACCOUNT_USER_IDS와 맞춘다.
const COMPLIMENTARY_TRAINER_USER_ID = 'healthy-trainer0';
const COMPLIMENTARY_STUDENT_USER_ID = 'healthy-student0';

const isComplimentaryAccount = (userId?: string | null) =>
  userId === COMPLIMENTARY_TRAINER_USER_ID || userId === COMPLIMENTARY_STUDENT_USER_ID;

const POLICY_URL = 'https://mewing-sun-887.notion.site/30a82fa5850c4a90b73f542f9916a735';
const PRIVACY_URL =
  'https://mewing-sun-887.notion.site/fcc610c6a4c04ae2813be8ff3d98c56b?pvs=4';

export {
  COMPLIMENTARY_STUDENT_USER_ID,
  COMPLIMENTARY_TRAINER_USER_ID,
  getBaseRedirectUri,
  getRedirectUri,
  getSocialAuthUrl,
  isComplimentaryAccount,
  POLICY_URL,
  PRIVACY_URL,
  resolveBaseUri,
};
