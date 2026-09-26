import { HTMLAttributes } from 'react';

import { LowercaseMemberType } from '@/entity/auth';
import { Layout as BaseLayout } from '@/shared/ui/layout';

import { StudentNavigation, TrainerNavigation } from './navigation';

interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  type?: LowercaseMemberType;
}

/** 역할별 하단 내비게이션을 붙인 Layout. 내비게이션이 필요 없는 하위 레이어는 `@/shared/ui`의 Layout을 쓴다. */
export const Layout = ({ type, ...props }: LayoutProps) => (
  <BaseLayout
    navigation={
      type === 'trainer' ? (
        <TrainerNavigation />
      ) : type === 'student' ? (
        <StudentNavigation />
      ) : undefined
    }
    {...props}
  />
);

Layout.Header = BaseLayout.Header;
Layout.Contents = BaseLayout.Contents;
Layout.BottomArea = BaseLayout.BottomArea;
