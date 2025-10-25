/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}
