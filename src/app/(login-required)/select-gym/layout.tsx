import { UserRoleMiddleware } from '@/app/_providers';

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <UserRoleMiddleware>{children}</UserRoleMiddleware>;
};

export default Layout;
