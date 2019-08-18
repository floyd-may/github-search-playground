import React from 'react'
import VisibilitySensor from 'react-visibility-sensor';
import { useSearch } from './SearchProvider';
import { useIsLimited } from './RateLimitProvider';
import ResultCard from './ResultCard';

function LoadingIndicator() {
  const isLimited = useIsLimited();

  return (
    <div className='loading-indicator'>
      Loading...
      { isLimited &&
        <div>
          (this may take a while; we've hit GitHub's rate limit)
        </div>
      }
    </div>
  );
  
}

export default function Loader({query}) {
  const { isLoading, items, loadNextPage, hasMorePages } = useSearch(query);

  return (
    <React.Fragment>
      { items && items.map(x => <ResultCard key={x.login} {...x} />) }

      { hasMorePages && 
        <VisibilitySensor onChange={(visible) => visible ? loadNextPage() : null}>
          <span>&nbsp;</span>
        </VisibilitySensor>
      }
      { isLoading && <LoadingIndicator /> }
    </React.Fragment>
  );
}
