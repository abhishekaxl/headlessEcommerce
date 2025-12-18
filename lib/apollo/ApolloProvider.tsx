/**
 * Apollo Provider Component
 * Wraps the app with Apollo Client provider
 */

'use client';

import { ApolloProvider as ApolloProviderClient } from '@apollo/client';
import { getApolloClient } from './client';
import { ReactNode } from 'react';

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  const client = getApolloClient();

  return <ApolloProviderClient client={client}>{children}</ApolloProviderClient>;
}

