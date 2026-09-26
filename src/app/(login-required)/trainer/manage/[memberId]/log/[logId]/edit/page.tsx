import { TrainerEditLogPage } from '@/page/feedback';

interface Props {
  params: Promise<{ logId: number; memberId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  return <TrainerEditLogPage logId={params.logId} />;
};

export default Page;
