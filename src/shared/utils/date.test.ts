import '@testing-library/jest-dom';

import dayjs from 'dayjs';

import {
  convertTo12HourFormat,
  formatTimestampToRelativeTime,
  getStartOfWeek,
  timeToDecimal,
} from './date';

// 테스트와 함수가 각각 현재 시각을 읽으므로, 그 사이에 1ms만 지나도 "2일 후"가 "1일 후"로 잘린다.
// 파일 전체에서 현재 시각을 고정한다. (2024-07-10 수요일 정오)
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2024-07-10T12:00:00'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getStartOfWeek', () => {
  it('주어진 Date 객체에 대해 해당 주의 시작일(월요일)을 반환해야 한다.', () => {
    const date = dayjs('2024-07-11').toDate();
    const result = getStartOfWeek(date);

    const expected = dayjs('2024-07-08').toDate();

    expect(dayjs(result).format('YYYY-MM-DD')).toBe(dayjs(expected).format('YYYY-MM-DD'));
  });

  it('string으로 주어진 날짜에 대해 해당 주의 시작일(월요일)을 반환해야 한다.', () => {
    const dateString = '2024-07-11';
    const result = getStartOfWeek(dateString);

    const expected = dayjs('2024-07-08').toDate();

    expect(dayjs(result).format('YYYY-MM-DD')).toBe(dayjs(expected).format('YYYY-MM-DD'));
  });

  it('날짜 객체가 주어지지 않았을 떄 오늘 날짜 기준으로 해당 주의 시작일(월요일)을 반환해야 한다.', () => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const expected = dayjs().subtract(1, 'days').startOf('week').add(1, 'days').toDate();
    expect(startOfWeek).toEqual(expected);
  });

  it('연초의 경계 날짜에 대해서 해당 주의 시작일(월요일)을 반환해야 한다.', () => {
    const date = dayjs('2023-01-01').toDate();
    const result = getStartOfWeek(date);

    const expected = dayjs('2022-12-26').toDate();

    expect(dayjs(result).format('YYYY-MM-DD')).toBe(dayjs(expected).format('YYYY-MM-DD'));
  });
});

describe('formatTimestampToRelativeTime', () => {
  it('현재 시간 기준 몇 초 전인지 반환', () => {
    const now = dayjs();
    const target = now.subtract(30, 'second').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('30초 전');
  });

  it('현재 시간 기준 몇 분 전인지 반환', () => {
    const now = dayjs();
    const target = now.subtract(15, 'minute').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('15분 전');
  });

  it('현재 시간 기준 몇 시간 전인지 반환', () => {
    const now = dayjs();
    const target = now.subtract(5, 'hour').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('5시간 전');
  });

  it('현재 시간 기준 몇 일 전인지 반환', () => {
    const now = dayjs();
    const target = now.subtract(3, 'day').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('3일 전');
  });

  it('현재 시간 기준 몇 초 후인지 반환', () => {
    const now = dayjs();
    const target = now.add(45, 'second').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('45초 후');
  });

  it('현재 시간 기준 몇 분 후인지 반환', () => {
    const now = dayjs();
    const target = now.add(20, 'minute').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('20분 후');
  });

  it('현재 시간 기준 몇 시간 후인지 반환', () => {
    const now = dayjs();
    const target = now.add(10, 'hour').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('10시간 후');
  });

  it('현재 시간 기준 몇 일 후인지 반환', () => {
    const now = dayjs();
    const target = now.add(2, 'day').toDate();
    expect(formatTimestampToRelativeTime(target)).toBe('2일 후');
  });

  it('기준 시간에 따라 과거 시간 비교', () => {
    const criteria = dayjs('2024-07-11T12:00:00').toDate();
    const target = dayjs('2024-07-11T11:00:00').toDate();
    expect(formatTimestampToRelativeTime(target, criteria)).toBe('1시간 전');
  });

  it('기준 시간에 따라 미래 시간 비교', () => {
    const criteria = dayjs('2024-07-11T12:00:00').toDate();
    const target = dayjs('2024-07-11T13:00:00').toDate();
    expect(formatTimestampToRelativeTime(target, criteria)).toBe('1시간 후');
  });
});

describe('timeToDecimal', () => {
  it('정오 (12:00) 변환', () => {
    expect(timeToDecimal('12:00')).toBe(12.0);
  });

  it('오전 9시 30분 변환', () => {
    expect(timeToDecimal('9:30')).toBe(9.5);
  });

  it('오후 3시 45분 변환', () => {
    expect(timeToDecimal('15:45')).toBe(15.75);
  });

  it('오전 1시 변환', () => {
    expect(timeToDecimal('1:00')).toBe(1.0);
  });

  it('오후 11시 59분 변환', () => {
    expect(timeToDecimal('23:59')).toBe(23.983333333333334); // 정확한 계산을 위해 소수점 이하 자릿수 확인 필요
  });
});

describe('convertTo12HourFormat 함수', () => {
  it('24시간 형식을 12시간 형식으로 변환하는지 확인', () => {
    // 테스트 케이스 1: 오전 시간
    const [convertedTimeAM, periodAM] = convertTo12HourFormat('08:30');
    expect(convertedTimeAM).toBe('8:30'); // 주의: 앞에 0이 없어야 함
    expect(periodAM).toBe('오전');

    // 테스트 케이스 2: 오후 시간
    const [convertedTimePM, periodPM] = convertTo12HourFormat('15:45');
    expect(convertedTimePM).toBe('3:45'); // 주의: 15:45는 12시간 형식으로 3:45 오후임
    expect(periodPM).toBe('오후');

    // 테스트 케이스 3: 자정
    const [convertedTimeMidnight, periodMidnight] = convertTo12HourFormat('00:00');
    expect(convertedTimeMidnight).toBe('12:00'); // 00:00은 12시간 형식으로 12:00 자정임
    expect(periodMidnight).toBe('오전');

    // 테스트 케이스 4: 정오
    const [convertedTimeNoon, periodNoon] = convertTo12HourFormat('12:30');
    expect(convertedTimeNoon).toBe('12:30'); // 12:30은 12시간 형식으로 12:30 오후임
    expect(periodNoon).toBe('오후');
  });
});
