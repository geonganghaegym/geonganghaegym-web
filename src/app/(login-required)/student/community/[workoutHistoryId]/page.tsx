import { CommunityDetailPage } from '@/page/workout';

interface Props {
  params: Promise<{ workoutHistoryId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  return <CommunityDetailPage workoutHistoryId={params.workoutHistoryId} />;
};

export default Page;
