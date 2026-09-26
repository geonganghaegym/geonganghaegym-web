import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const clearSessionQueries = () => {
  void queryClient.cancelQueries();
  queryClient.clear();
};
