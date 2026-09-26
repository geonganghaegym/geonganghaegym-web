'use client';

import { use } from 'react';

import { DietEditProvider } from '@/page/feedback';

interface Props {
  params: Promise<{ dietId: number }>;
}

const Page = (props: Readonly<Props>) => {
  const params = use(props.params);
  return <DietEditProvider dietId={params.dietId} />;
};

export default Page;
