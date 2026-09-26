import { forwardRef, HTMLAttributes } from 'react';

import { Typography } from '../mixin';
import { cn } from '../utils/tw-utils';

const CARD_NAME = 'Card';
const CardRoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex w-40 flex-col gap-y-2 rounded-lg bg-white p-6',
        className
      )}
      {...props}
    />
  )
);
CardRoot.displayName = CARD_NAME;

const CARD_HEADER_NAME = 'CardHeader';
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, forwardedRef) => (
    <div
      ref={forwardedRef}
      className={cn(Typography.TITLE_1_BOLD, className)}
      {...props}
    />
  )
);
CardHeader.displayName = CARD_HEADER_NAME;

const CARD_CONTENT_NAME = 'CardContent';
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, forwardedRef) => (
    <div
      ref={forwardedRef}
      className={cn(
        Typography.BODY_4_REGULAR,
        'whitespace-pre-wrap text-gray-500',
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = CARD_CONTENT_NAME;

const CARD_FOOTER_NAME = 'CardFooter';
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, forwardedRef) => (
    <div ref={forwardedRef} className={cn(className)} {...props} />
  )
);
CardFooter.displayName = CARD_FOOTER_NAME;

const Card = Object.assign(CardRoot, {
  Content: CardContent,
  Footer: CardFooter,
  Header: CardHeader,
});

export { Card, CardContent, CardFooter, CardHeader, CardRoot };
