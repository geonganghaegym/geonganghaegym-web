import { EditWorkoutPage } from '@/page/workout';

interface Props {
  params: Promise<{ workoutHistoryId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  return <EditWorkoutPage workoutHistoryId={params.workoutHistoryId} />;
};

export default Page;
