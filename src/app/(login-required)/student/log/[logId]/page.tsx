import { StudentLogDetailPage } from '@/page/feedback';

interface Props {
  params: Promise<{ logId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  return <StudentLogDetailPage logId={params.logId} />;
};

export default Page;
