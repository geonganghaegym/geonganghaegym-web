import { TrainerStudentDietDetailPage } from '@/page/feedback';

interface Props {
  params: Promise<{ memberId: number; dietId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  const memberId = params.memberId;
  const dietId = params.dietId;
  return <TrainerStudentDietDetailPage memberId={memberId} dietId={dietId} />;
};
export default Page;
