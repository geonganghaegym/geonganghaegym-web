import { SoldOutReason } from './model/type';

const SCHEDULE_ACTIVE_COLORS = [
  {
    bg: '#FFE4E5',
    border: '#FF7C80',
  },
  {
    bg: '#FFEFC7',
    border: '#FFC83B',
  },
  {
    bg: '#E2F3FF',
    border: '#70BAFF',
  },
  {
    bg: '#E5E3FF',
    border: '#9175FF',
  },
  {
    bg: '#FDE8FF',
    border: '#E57FFE',
  },
];

const SCHEDULE_AVAILABLE_COLOR = {
  bg: '#fff',
  border: 'transparent',
};

const SCHEDULE_DISABLED_COLORS = {
  bg: 'transparent',
  border: 'transparent',
};

const SCHEDULE_NOSHOW_COLOR = {
  bg: '#F2F3F5',
  border: '#A7A9AE',
};

const CLASS_TIME_DEFAULT = {
  lessonStartTime: '10:00',
  lessonEndTime: '20:00',
  lunchStartTime: '12:00',
  lunchEndTime: '13:00',
  lessonTime: 60,
  closedDays: [],
};

const SOLD_OUT_LABELS: Record<SoldOutReason, string> = {
  PAST: '종료',
  MY_RESERVATION: '내 예약',
  RESERVATION_CLOSED: '예약 마감',
  WAITING_FULL: '대기 마감',
  WAITING_CLOSED: '대기 불가',
};

/** 사유가 없는 마감(구버전 서버 응답 등)은 기존 문구를 쓴다 */
const soldOutLabel = (reason?: SoldOutReason | null) =>
  (reason && SOLD_OUT_LABELS[reason]) ?? '마감';

export {
  CLASS_TIME_DEFAULT,
  SCHEDULE_ACTIVE_COLORS,
  SCHEDULE_AVAILABLE_COLOR,
  SCHEDULE_DISABLED_COLORS,
  SCHEDULE_NOSHOW_COLOR,
  soldOutLabel,
};
