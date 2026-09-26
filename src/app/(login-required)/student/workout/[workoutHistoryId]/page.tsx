import { StudentWorkoutDetailPage } from '@/page/workout';

interface Props {
  params: Promise<{ workoutHistoryId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  return <StudentWorkoutDetailPage workoutHistoryId={params.workoutHistoryId} />;
};

export default Page;
