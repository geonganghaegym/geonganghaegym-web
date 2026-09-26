interface AllScheduleData {
  scheduleId: number;
  lessonDt: string;
  lessonStartTime: string;
  lessonEndTime: string;
  reservationStatus: string;
  round: number;
  trainerName: string;
  applicantName: string | null;
  waitingByName: string | null;
  soldOutReason?: SoldOutReason | null;
}

/** reservationStatus가 SOLD_OUT일 때 서버가 함께 내려주는 마감 사유 */
type SoldOutReason =
  | 'PAST'
  | 'MY_RESERVATION'
  | 'RESERVATION_CLOSED'
  | 'WAITING_FULL'
  | 'WAITING_CLOSED';

interface ScheduleData {
  scheduleId: number;
  lessonDt: string;
  lessonStartTime: string;
  lessonEndTime: string;
  reservationStatus: string;
  trainerName: string;
}

interface CourseData {
  courseId: number;
  totalLessonCnt: number;
  remainLessonCnt: number;
  createdAt: string;
}

interface MyReservationResponse {
  course: CourseData;
  reservations: ScheduleData[] | null;
}

interface MyWaitingResponse {
  course: CourseData;
  myScheduleWaitings: ScheduleData[] | null;
}

type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

// 트레이너 스케줄 서버 데이터
interface TrainerSchedule {
  scheduleId: number;
  duration: number;
  lessonStartTime: string;
  lessonEndTime: string;
  reservationStatus: ReservationStatus;
  applicantId?: number | null;
  applicantName?: string | null;
  waitingStudentId?: number | null;
  waitingStudentName?: string | null;
}

interface ClassTimeSettingData {
  lessonStartTime: string;
  lessonEndTime: string;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  closedDays: DayOfWeek[];
  lessonTime: number;
}
type ReservationStatus =
  | 'COMPLETED'
  | 'AVAILABLE'
  | 'NO_SHOW'
  | 'SOLD_OUT'
  | 'DISABLED'
  | 'LUNCH_TIME';

type TrainerWeeklySchedule = Record<string, TrainerSchedule[]>;

interface ScheduleColor {
  bg: string;
  border: string;
}

interface ScheduleOffset {
  x: number;
  y: number;
}

interface FlatSchedule extends TrainerSchedule {
  date: string;
  offset: ScheduleOffset;
  color: ScheduleColor | null;
}

interface TodaySchedule {
  trainerName: string;
  scheduleTotalCount: number;
  schedule: TrainerSchedule[];
}

export type {
  AllScheduleData,
  ClassTimeSettingData,
  CourseData,
  DayOfWeek,
  FlatSchedule,
  MyReservationResponse,
  MyWaitingResponse,
  ReservationStatus,
  ScheduleColor,
  ScheduleData,
  ScheduleOffset,
  SoldOutReason,
  TodaySchedule,
  TrainerSchedule,
  TrainerWeeklySchedule,
};
