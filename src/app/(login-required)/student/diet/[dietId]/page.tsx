'use client';

import { use } from 'react';

import { StudentDietDetailPage } from '@/page/feedback';

interface Props {
  params: Promise<{ dietId: number }>;
}

const Page = (props: Readonly<Props>) => {
  const params = use(props.params);
  return <StudentDietDetailPage dietId={params.dietId} />;
};

export default Page;
