import { TrainerLogDetailPage } from '@/page/feedback';

interface Props {
  params: Promise<{ logId: number; memberId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  return <TrainerLogDetailPage logId={params.logId} memberId={params.memberId} />;
};

export default Page;
