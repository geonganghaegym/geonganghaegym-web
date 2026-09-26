import { TrainerLogPage } from '@/page/feedback';

interface Props {
  params: Promise<{ memberId: number }>;
}

const Page = async (props: Readonly<Props>) => {
  const params = await props.params;
  return <TrainerLogPage memberId={params.memberId} />;
};

export default Page;
