import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'
import { queryClient } from './queryClient'

export const QueryProvider: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}

QueryProvider.displayName = 'QueryProvider'
