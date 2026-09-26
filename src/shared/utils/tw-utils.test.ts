import { Typography } from '@/shared/mixin';

import { cn } from './tw-utils';

// tailwind-merge 3 + Tailwind 4 업그레이드 회귀 방지: 타이포 상수(임의값 font-size/line-height)와
// 색상 클래스를 합칠 때 어느 한쪽이 지워지면 전 화면 글자 스타일이 깨진다.
describe('cn', () => {
  it('타이포 상수 뒤에 색상 클래스를 붙여도 둘 다 남는다', () => {
    const result = cn(Typography.TITLE_3, 'text-gray-600').split(' ');

    expect(result).toEqual(
      expect.arrayContaining(['text-[14px]/[150%]', 'font-semibold', 'text-gray-600'])
    );
  });

  it('같은 속성은 뒤에 온 클래스가 이긴다', () => {
    expect(cn('p-0', 'px-7')).toBe('p-0 px-7');
    expect(cn('px-7', 'p-0')).toBe('p-0');
    expect(cn('h-[48px]', 'h-12')).toBe('h-12');
    expect(cn(Typography.TITLE_3, Typography.BODY_2)).toBe(
      'text-[14px]/[150%] font-normal'
    );
  });

  it('조건부 클래스(falsy)는 무시한다', () => {
    expect(cn('flex', false, undefined, null, '', 'items-center')).toBe(
      'flex items-center'
    );
  });
});
