import { StudentPointDetailPage } from '@/page/manage';

interface Props {
  params: Promise<{ memberId: number }>;
}

const Page = async (props: Props) => {
  const params = await props.params;
  const memberId = params.memberId;
  return <StudentPointDetailPage memberId={memberId} />;
};
export default Page;
