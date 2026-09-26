declare module '*.svg' {
  import type { FC, SVGProps } from 'react';

  const svg: FC<SVGProps<SVGSVGElement>>;

  export default svg;
}
