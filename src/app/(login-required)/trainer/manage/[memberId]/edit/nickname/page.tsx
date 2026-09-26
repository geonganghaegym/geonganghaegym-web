import { StudentEditNickname } from '@/page/manage/ui/StudentEditNickname';
interface Props {
  params: Promise<{ memberId: number }>;
}
const Page = async (props: Props) => {
  const params = await props.params;
  return <StudentEditNickname memberId={params.memberId} />;
};

export default Page;
