import { NextRequest, NextResponse } from 'next/server';

/**
 * 리버스 프록시(ingress-nginx) 뒤에서 실행되므로 req.nextUrl.origin 은
 * 컨테이너 바인딩 주소(https://0.0.0.0:3000)로 계산된다.
 * 프록시가 전달하는 X-Forwarded-* 를 우선 사용해 외부에서 접근 가능한 origin 을 만든다.
 */
const resolveOrigin = (req: NextRequest) => {
  const forwardedHost = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto') ?? 'https';

  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  return process.env.NEXT_PUBLIC_WEB_URI ?? req.nextUrl.origin;
};

export async function POST(req: NextRequest) {
  const origin = resolveOrigin(req);

  try {
    const formData = await req.formData();

    const state = formData.get('state') as string | null;
    const code = formData.get('code') as string | null;
    const id_token = formData.get('id_token') as string | null;
    const user = formData.get('user') as string | null;

    const redirectUrl = new URL('/apple/callback', origin);

    if (state) redirectUrl.searchParams.set('state', state);

    // code/id_token/user 는 쿼리 대신 URL fragment 로 전달한다 — fragment 는 서버로
    // 전송되지 않으므로 리버스 프록시·서버 로그와 Referer 에 남지 않는다.
    const hashParams = new URLSearchParams();
    if (code) hashParams.set('code', code);
    if (id_token) hashParams.set('id_token', id_token);
    if (user) hashParams.set('user', user);
    redirectUrl.hash = hashParams.toString();

    return NextResponse.redirect(redirectUrl, 302);
  } catch {
    return NextResponse.redirect(new URL('/', origin), 302);
  }
}
