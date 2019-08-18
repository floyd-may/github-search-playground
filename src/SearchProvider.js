import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

const LocalContext = createContext({
  fetch: (...args) => window.fetch(...args),
});

async function getUserDetails(user, fetch) {
  const url = `https://api.github.com/users/${user.login}`;

  const response = await fetch(url);

  const data = await response.json();

  return { ...user, ...data };
}

async function loadData(queryUrl, fetch) {
  const response = await fetch(queryUrl);
  if(response.status !== 200) {
    return { items: [] };
  }
  const linkHeader = response.headers.get('link') || '';
  const nextLink = linkHeader
    .split(',')
    .map(x => x.split(';'))
    .filter(x => x.length === 2)
    .find(x => x[1].trim() === 'rel="next"');
  const nextPageUrl = nextLink != null
    ? nextLink[0].trim().replace(/>$/, '').replace(/^</, '')
    : null;

  const { items } = await response.json();

  const detailedItemsPromises = items
    .map((item) => getUserDetails(item, fetch));

  return {
    items: await Promise.all(detailedItemsPromises),
    nextPageUrl
  };
}

export function useSearch(query) {
  const [state, setState] = useState({});
  const { fetch } = useContext(LocalContext);
  useEffect(() => {
    if(!query) {
      return;
    }
    const queryUrl = `https://api.github.com/search/users?q=${query}&per_page=5`;
    setState({ isLoading: true });
    (async () => {
      const { items, nextPageUrl } = await loadData(queryUrl, fetch);

      setState({ items, nextPageUrl });
    })();
  }, [query, fetch]);

  async function loadNextPage() {
    if(!state.nextPageUrl) {
      return;
    }
    setState({ ...state, isLoading: true });

    const { items, nextPageUrl } = await loadData(state.nextPageUrl, fetch);

    setState({ items: state.items.concat(items), nextPageUrl });
  }

  return {
    items: state.items,
    loadNextPage,
    isLoading: !!state.isLoading,
    hasMorePages: !!state.nextPageUrl
  };
}

export default function SearchProvider({fetch, children}) {
  const dependencies = {
    fetch
  };
  return (
    <LocalContext.Provider value={dependencies}>
      {children}
    </LocalContext.Provider>
  );
}
