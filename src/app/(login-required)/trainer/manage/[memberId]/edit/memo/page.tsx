import { StudentEditMemo } from '@/page/manage/ui/StudentEditMemo';
interface Props {
  params: Promise<{ memberId: number }>;
}
const Page = async (props: Props) => {
  const params = await props.params;
  return <StudentEditMemo memberId={params.memberId} />;
};

export default Page;
