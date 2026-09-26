import { TrainerWorkoutDetailPage } from '@/page/workout';

interface Props {
  params: Promise<{ workoutHistoryId: number; memberId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  const { workoutHistoryId, memberId } = params;
  return (
    <TrainerWorkoutDetailPage workoutHistoryId={workoutHistoryId} memberId={memberId} />
  );
};

export default Page;
