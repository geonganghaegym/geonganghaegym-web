import { TrainerStudentDietListPage } from '@/page/feedback';

interface Props {
  params: Promise<{ memberId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  const memberId = params.memberId;
  return <TrainerStudentDietListPage memberId={memberId} />;
};
export default Page;
