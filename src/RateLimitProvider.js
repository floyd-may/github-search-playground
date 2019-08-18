import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import rateLimited from './rateLimitedFetch';

const LocalContext = createContext();

export default function RateLimitProvider({ children }) {
  const [isLimited, setIsLimited] = useState(false);
  const [rlFetch, setRlFetch] = useState({});
  useEffect(() => {
    const fn = rateLimited(window.fetch, window, setIsLimited);
    setRlFetch({ fn });
  }, []);

  const contextValue = {
    isLimited,
    fetch: rlFetch.fn
  };
  return (
    <LocalContext.Provider value={contextValue}>
      { rlFetch != null ? children : null }
    </LocalContext.Provider>
  );
}

export function useRateLimitedFetch() {
  const { fetch } = useContext(LocalContext);

  return fetch;
}

export function useIsLimited() {
  const { isLimited } = useContext(LocalContext);

  return isLimited;
}

