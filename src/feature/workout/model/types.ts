import { SocialType } from '@/entity/auth';
import { Gym } from '@/entity/gym';
import { ImageType } from '@/entity/image';

interface Workout {
  workoutHistoryId: number;
  content: string;
  liked: boolean;
  likeCnt: number;
  commentCnt: number;
  viewMySelf: boolean;
  createdAt: Date;
  files: ImageType[];
  completedExercises: Exercise[];
}

interface WorkoutMember {
  id: number;
  userId: string;
  email: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  delYn: boolean;
  profile: {
    id: number;
    fileUrl: string;
  };
  memberType: 'STUDENT';
  pushAlarmStatus: 'ENABLED' | 'DISABLE';
  feedbackAlarmStatus: 'ENABLED' | 'DISABLE';
  gym: Gym | null;
  socialType: SocialType;
}

interface WorkoutDetail extends Workout {
  member: WorkoutMember;
}

// 운동 기록 조회 시 반환되는 운동 정보
interface Exercise {
  exerciseId: number;
  name: string;
  setNum: number;
  weight: number;
  numberOfCycles: number;
  workoutHistoryId: number;
}

interface WorkoutComment {
  id: number;
  member: {
    memberId: number;
    name: string;
    fileUrl: string;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: number | null;
  orderNum: number;
  delYn: boolean;
  replies: WorkoutComment[] | null;
}

// 운동 기록 작성 시 운동 정보 요청 형식
type ExerciseForCreate = Omit<Exercise, 'name' | 'workoutHistoryId'>;

// 운동 종류
interface ExerciseType {
  exerciseId: number;
  names: string;
  category: string;
  muscles: string;
  custom: boolean;
}

// 운동 정보(횟수, 세트 등) + 운동 종류(카테고리, 사용근육 등)
interface ComplexExercise extends ExerciseForCreate, ExerciseType {}

interface WorkoutCategory {
  category: string;
  name: string;
}

interface CommunityWorkout {
  workoutHistoryId: number;
  content: string;
  liked: boolean;
  likeCnt: number;
  commentCnt: number;
  viewMySelf: boolean;
  createdAt: Date;
  files: ImageType[];
  completedExercises: Exercise[];
  member: WorkoutMember;
}

export type {
  CommunityWorkout,
  ComplexExercise,
  Exercise,
  ExerciseForCreate,
  ExerciseType,
  Workout,
  WorkoutCategory,
  WorkoutComment,
  WorkoutDetail,
  WorkoutMember,
};
