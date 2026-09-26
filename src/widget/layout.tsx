import { Children, HTMLAttributes, isValidElement, ReactNode } from 'react';

import { LowercaseMemberType } from '@/entity/auth';
import { cn } from '@/shared/utils';

import { StudentNavigation, TrainerNavigation } from './navigation';

interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  type?: LowercaseMemberType;
}

export const Layout = ({ type, className, children, ...props }: LayoutProps) => {
  let header: ReactNode;
  const contents: ReactNode[] = [];
  let footer: ReactNode;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Header) {
      header = child;
    } else if (child.type === BottomArea) {
      footer = child;
    } else {
      contents.push(child);
    }
  });

  return (
    <div className={'flex h-full items-center justify-center bg-black'}>
      <div
        className={cn('flex h-full w-(--max-width) flex-col bg-gray-100', className)}
        {...props}>
        {header}
        {contents}
        {type === 'trainer' && <TrainerNavigation />}
        {type === 'student' && <StudentNavigation />}
        {type === undefined && footer}
      </div>
    </div>
  );
};

const Header = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <header
    className={cn(
      'relative flex h-[56px] w-full flex-none items-center justify-between px-7 py-6',
      className
    )}
    {...props}>
    {children}
  </header>
);
Header.displayName = 'Header';

const Contents = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <main
    className={cn('h-full w-full flex-1 shrink-0 overflow-y-auto', className)}
    {...props}>
    {children}
  </main>
);
Contents.displayName = 'Contents';

const BottomArea = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <footer className={cn('w-full p-7', className)} {...props}>
    {children}
  </footer>
);

Layout.Header = Header;
Layout.Contents = Contents;
Layout.BottomArea = BottomArea;
