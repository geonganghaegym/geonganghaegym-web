import { TrainerWorkoutPage } from '@/page/workout';

interface Props {
  params: Promise<{ memberId: number }>;
}

const Page = async (props: Readonly<Props>) => {
  const params = await props.params;
  return <TrainerWorkoutPage memberId={params.memberId} />;
};

export default Page;
