import React from 'react';
import RateLimitProvider, { useRateLimitedFetch } from './RateLimitProvider';
import SearchProvider from './SearchProvider';

function InnerProvider({ children }) {
  const fetch = useRateLimitedFetch();

  return (
    <SearchProvider fetch={fetch}>
      {children}
    </SearchProvider>
  );
}

export default function ComposedSearchProvider({ children }) {
  return (
    <RateLimitProvider>
      <InnerProvider>
        { children }
      </InnerProvider>
    </RateLimitProvider>
  );
}
