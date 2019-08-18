import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { nextTick, OnRender } from './testUtils';
import SearchProvider, { useSearch } from './SearchProvider';

let fetchSandbox, div;

beforeEach(() => {
  fetchSandbox = fetchMock.sandbox();
  fetchSandbox.config.overwriteRoutes = true;
  div = document.createElement('div');
});
afterEach(() => {
  ReactDOM.unmountComponentAtNode(div);
});

const searchQuery = 'sample search query';

function Testee({ render, fetch }) {
  return (
      <SearchProvider fetch={fetch}>
        <OnRender render={render} />
      </SearchProvider>
  );
}

const searchUrl = (query) => `https://api.github.com/search/users?q=${query}&per_page=5`;

function userUrl(login) {
  return `https://api.github.com/users/${login}`;
}

function setupUserJsonResult(login, result) {
  fetchSandbox.mock(userUrl(login), JSON.stringify(result));
}

it('issues no http request on empty string query', async () => {
  let state;
  const elem = (
    <Testee fetch={fetchSandbox} render={() => {
      state = useSearch('');
    }} />
  );
  ReactDOM.render(elem, div);
  await act(async () => {
    await nextTick();
  });
  expect(state.isLoading).toBe(false);
});

describe('single page of results', () => {
  beforeEach(() => {
    fetchSandbox.mock(searchUrl(searchQuery), JSON.stringify({
      items: [
        { login: 'user-a' },
        { login: 'user-b' },
        { login: 'user-c' },
        { login: 'user-d' },
      ]
    }));
    setupUserJsonResult('user-a', { addlProp: 'user-a-extra' });
    setupUserJsonResult('user-b', { addlProp: 'user-b-extra' });
    setupUserJsonResult('user-c', { addlProp: 'user-c-extra' });
    setupUserJsonResult('user-d', { addlProp: 'user-d-extra' });
  });

  it('merges results from search and user endpoints', async () => {
    let result;
    const elem = (
      <Testee fetch={fetchSandbox} render={() => {
        const { items } = useSearch(searchQuery);
        result = items;
      }} />
    );
    ReactDOM.render(elem, div);
    await act(async () => {
      await nextTick();
      await fetchSandbox.flush(true);
    });
    expect(result).toEqual([
        { login: 'user-a', addlProp: 'user-a-extra' },
        { login: 'user-b', addlProp: 'user-b-extra' },
        { login: 'user-c', addlProp: 'user-c-extra' },
        { login: 'user-d', addlProp: 'user-d-extra' },
    ]);
  });

  it('nops on loadNextPage', async () => {
    let doLoadNextPage;
    const elem = (
      <Testee fetch={fetchSandbox} render={() => {
        const { loadNextPage } = useSearch(searchQuery);
        doLoadNextPage = loadNextPage;
      }} />
    );
    ReactDOM.render(elem, div);
    let requestCount;
    await act(async () => {
      await nextTick();
      await fetchSandbox.flush(true);
      requestCount = fetchSandbox.calls().length;
      await doLoadNextPage();
      await nextTick();
      await fetchSandbox.flush(true);
    });
    expect(fetchSandbox.calls().length).toBe(requestCount);
  });

  it('sets isLoading while request is pending', async () => {
    fetchSandbox.mock(searchUrl(searchQuery), new Promise(() => {})); // never resolves
    let isLoading;
    const elem = (
      <Testee fetch={fetchSandbox} render={() => {
        const searchState = useSearch(searchQuery);
        isLoading = searchState.isLoading;
      }} />
    );
    ReactDOM.render(elem, div);
    await act(async () => {
      await nextTick();
    });
    expect(isLoading).toBe(true);
  });
  it('sets isLoading to false when request finishes', async () => {
    let isLoading;
    const elem = (
      <Testee fetch={fetchSandbox} render={() => {
        const searchState = useSearch(searchQuery);
        isLoading = searchState.isLoading;
      }} />
    );
    ReactDOM.render(elem, div);
    await act(async () => {
      await nextTick();
      await fetchSandbox.flush(true);
    });
    expect(isLoading).toBe(false);
  });
});

describe('multiple pages of results', () => {
  const page1Url = searchUrl(searchQuery);
  const page2Url = searchUrl(searchQuery) + 'page2';
  const page3Url = searchUrl(searchQuery) + 'page3';
  beforeEach(() => {
    fetchSandbox.mock(page1Url, {
      status: 200,
      headers: {
        Link: `<${page2Url}>; rel="next", <http://nope.example.com>; rel="last"`
      },
      body: { items: [
          { login: 'user-a' },
          { login: 'user-b' },
          { login: 'user-c' },
          { login: 'user-d' },
      ]}
    });
    fetchSandbox.mock(page2Url, {
      headers: {
        'Link': `<${page3Url}>; rel="next", <http://nope.example.com>; rel="last"`
      },
      body: { items: [
          { login: 'user-e' },
          { login: 'user-f' },
          { login: 'user-g' },
          { login: 'user-h' },
      ]}
    });
    fetchSandbox.mock(page3Url, {
      headers: {
        'Link': `<http://nope.example.com>; rel="prev", <http://nope.example.com>; rel="first"`
      },
      body: { items: [
          { login: 'user-i' },
          { login: 'user-j' },
          { login: 'user-k' },
          { login: 'user-l' },
      ]}
    });
    setupUserJsonResult('user-a', { addlProp: 'user-a-extra' });
    setupUserJsonResult('user-b', { addlProp: 'user-b-extra' });
    setupUserJsonResult('user-c', { addlProp: 'user-c-extra' });
    setupUserJsonResult('user-d', { addlProp: 'user-d-extra' });
    setupUserJsonResult('user-e', { addlProp: 'user-e-extra' });
    setupUserJsonResult('user-f', { addlProp: 'user-f-extra' });
    setupUserJsonResult('user-g', { addlProp: 'user-g-extra' });
    setupUserJsonResult('user-h', { addlProp: 'user-h-extra' });
    setupUserJsonResult('user-i', { addlProp: 'user-i-extra' });
    setupUserJsonResult('user-j', { addlProp: 'user-j-extra' });
    setupUserJsonResult('user-k', { addlProp: 'user-k-extra' });
    setupUserJsonResult('user-l', { addlProp: 'user-l-extra' });
  });

  it('loads second page on loadNextPage', async () => {
    let doLoadNextPage, result;
    const elem = (
      <Testee fetch={fetchSandbox} render={() => {
        const { loadNextPage, items } = useSearch(searchQuery);
        doLoadNextPage = loadNextPage;
        result = items;
      }} />
    );
    ReactDOM.render(elem, div);
    await act(async () => {
      await nextTick();
      await fetchSandbox.flush(true);
      doLoadNextPage();
      await nextTick();
      await fetchSandbox.flush(true);
    });
    expect(result).toEqual([
      { login: 'user-a', addlProp: 'user-a-extra' },
      { login: 'user-b', addlProp: 'user-b-extra' },
      { login: 'user-c', addlProp: 'user-c-extra' },
      { login: 'user-d', addlProp: 'user-d-extra' },
      { login: 'user-e', addlProp: 'user-e-extra' },
      { login: 'user-f', addlProp: 'user-f-extra' },
      { login: 'user-g', addlProp: 'user-g-extra' },
      { login: 'user-h', addlProp: 'user-h-extra' }
    ]);
  });

  it('sets loading flag on subsequent pages', async () => {
    fetchSandbox.mock(page2Url, new Promise(() => {})); // never resolves
    let isLoading, doLoadNextPage;
    const elem = (
      <Testee fetch={fetchSandbox} render={() => {
        const searchState = useSearch(searchQuery);
        isLoading = searchState.isLoading;
        doLoadNextPage = searchState.loadNextPage;
      }} />
    );
    ReactDOM.render(elem, div);
    await act(async () => {
      await nextTick();
      await fetchSandbox.flush(true);
      doLoadNextPage();
      await nextTick();
    });
    expect(isLoading).toBe(true);
  });

  it('loads third page', async () => {
    let doLoadNextPage, result;
    const elem = (
      <Testee fetch={fetchSandbox} render={() => {
        const { loadNextPage, items } = useSearch(searchQuery);
        doLoadNextPage = loadNextPage;
        result = items;
      }} />
    );
    ReactDOM.render(elem, div);
    await act(async () => {
      await nextTick();
      await fetchSandbox.flush(true);
      doLoadNextPage();
      await nextTick();
      await fetchSandbox.flush(true);
      doLoadNextPage();
      await nextTick();
      await fetchSandbox.flush(true);
    });
    expect(result).toEqual([
      { login: 'user-a', addlProp: 'user-a-extra' },
      { login: 'user-b', addlProp: 'user-b-extra' },
      { login: 'user-c', addlProp: 'user-c-extra' },
      { login: 'user-d', addlProp: 'user-d-extra' },
      { login: 'user-e', addlProp: 'user-e-extra' },
      { login: 'user-f', addlProp: 'user-f-extra' },
      { login: 'user-g', addlProp: 'user-g-extra' },
      { login: 'user-h', addlProp: 'user-h-extra' },
      { login: 'user-i', addlProp: 'user-i-extra' },
      { login: 'user-j', addlProp: 'user-j-extra' },
      { login: 'user-k', addlProp: 'user-k-extra' },
      { login: 'user-l', addlProp: 'user-l-extra' }
    ]);
  });
});
