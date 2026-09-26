type AlarmType = 'SCHEDULE' | 'COMMUNITY';

type NotificationCategoryAndType =
  | 'SCHEDULE-FEEDBACK' //피드백
  | 'SCHEDULE-RESERVE' //예약완료
  | 'SCHEDULE-CANCEL' //예약 취소
  | 'SCHEDULE-WAITING' //대기 예약 확정
  | 'COMMUNITY-COMMENT' //커뮤니티 게시글 댓글
  | 'COMMUNITY-WRITE' // 커뮤니티 게시글 작성
  | 'COMMUNITY-REPLY' //커뮤니티 게시글 댓글
  | 'SCHEDULE-WRITE' //수업 일지 게시글 작성
  | 'SCHEDULE-REPLY' //수업 일지 게시글 댓글
  | 'SCHEDULE-COMMENT'; //수업 일지 게시글 댓글

interface AlarmData {
  notificationId: number;
  notificationCategoryAndType: NotificationCategoryAndType;
  title: string;
  content: string;
  createdAt: Date | string;
  isRead: boolean;
  targetId: number;
  receiverId: number;
  receiverName: string;
  studentId: number;
  studentName: string;
}

interface SenderType {
  profileUrl: string;
  senderType: string;
}
export type { AlarmData, AlarmType, NotificationCategoryAndType, SenderType };
