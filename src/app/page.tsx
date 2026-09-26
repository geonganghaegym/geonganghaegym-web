'use client';

import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { auth } from '@/entity/auth';
import { OnboardingPage } from '@/page/public';

export default function Page() {
  const [role, setRole] = useState<string | null>();

  useEffect(() => {
    const { memberType } = auth();
    const newRole = memberType ?? null;
    setRole(newRole);
  }, [role]);

  if (role === undefined) {
    return (
      <div className='flex-center bg-primary-500 h-screen w-screen'>
        <Image
          src='/images/loading_splash.gif'
          width={88}
          height={88}
          alt='loading'
          priority
        />
      </div>
    );
  }

  if (role === null) {
    return <OnboardingPage />;
  }

  return redirect(`/${role?.toLowerCase()}`);
}
