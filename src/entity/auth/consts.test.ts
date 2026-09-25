import { resolveBaseUri } from './consts';

describe('resolveBaseUri', () => {
  const originalWebUri = process.env.NEXT_PUBLIC_WEB_URI;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WEB_URI = 'https://geonganghaejim.site';
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_WEB_URI = originalWebUri;
  });

  it.each([
    'https://geonganghaejim.site',
    'https://health.junghaebom.com',
    'https://geonganghaegym.junghaebom.com',
  ])('허용된 origin(%s)이면 그 origin을 그대로 쓴다.', (origin) => {
    expect(resolveBaseUri(origin)).toBe(origin);
  });

  it('허용되지 않은 origin이면 NEXT_PUBLIC_WEB_URI로 폴백한다.', () => {
    expect(resolveBaseUri('https://evil.example.com')).toBe('https://geonganghaejim.site');
    expect(resolveBaseUri('https://geonganghaejim.site.evil.com')).toBe(
      'https://geonganghaejim.site'
    );
  });

  it('NEXT_PUBLIC_WEB_URI도 없으면 현재 origin을 쓴다.', () => {
    delete process.env.NEXT_PUBLIC_WEB_URI;
    expect(resolveBaseUri('http://localhost:3000')).toBe('http://localhost:3000');
    expect(resolveBaseUri(undefined)).toBe('');
  });
});
