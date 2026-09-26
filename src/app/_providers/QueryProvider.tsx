'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

import { queryClient } from '@/shared/lib/query-client';

import { NativePushProvider } from './NativePushProvider';

export const QueryProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <NativePushProvider />
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
