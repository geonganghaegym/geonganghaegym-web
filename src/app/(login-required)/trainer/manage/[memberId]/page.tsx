import { TrainerStudentDetailPage } from '@/page/manage';

interface Props {
  params: Promise<{ memberId: number }>;
}

const Page = async (props: Readonly<Props>) => {
  const params = await props.params;
  return <TrainerStudentDetailPage memberId={params.memberId} />;
};

export default Page;
