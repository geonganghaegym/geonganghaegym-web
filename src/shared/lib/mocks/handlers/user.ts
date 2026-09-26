import { http, HttpResponse } from 'msw';

const User = [
  {
    statusCode: '100 CONTINUE',
    message: 'string',
    data: {
      email: 'kjy@example.com',
      name: '김진영',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
  },
];

const handlers = [
  http.post('/api/login', () => {
    // 실패 응답
    // return HttpResponse.text(JSON.stringify('user_exists'), {
    //   status: 401,
    // });

    // 성공 응답
    return HttpResponse.json(User[0], {
      headers: {
        'Set-Cookie': 'connect.sid=msw-cookie;HttpOnly;Path=/',
      },
    });
  }),
  http.post('/api/logout', () => {
    // 로그아웃
    return new HttpResponse(null, {
      headers: {
        'Set-Cookie': 'connect.sid=;HttpOnly;Path=/;Max-Age=0',
      },
    });
  }),
];

export default handlers;
