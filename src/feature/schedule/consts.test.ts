import { soldOutLabel } from './consts';

describe('soldOutLabel', () => {
  it('서버가 준 마감 사유별로 다른 문구를 보여준다', () => {
    expect(soldOutLabel('PAST')).toBe('종료');
    expect(soldOutLabel('MY_RESERVATION')).toBe('내 예약');
    expect(soldOutLabel('RESERVATION_CLOSED')).toBe('예약 마감');
    expect(soldOutLabel('WAITING_FULL')).toBe('대기 마감');
    expect(soldOutLabel('WAITING_CLOSED')).toBe('대기 불가');
  });

  it('사유가 없으면(구버전 서버 응답) 기존 문구 "마감"을 쓴다', () => {
    expect(soldOutLabel(undefined)).toBe('마감');
    expect(soldOutLabel(null)).toBe('마감');
  });
});
