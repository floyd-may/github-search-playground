import fetchMock from 'fetch-mock';
import { nextTick } from './testUtils';
import lolex from 'lolex';
import rateLimited from './rateLimitedFetch';

const url = "https://irrelevant.example.com";
let fetchSandbox, clock;

beforeEach(() => {
  fetchSandbox = fetchMock.sandbox();
  fetchSandbox.config.overwriteRoutes = true;
  clock = lolex.createClock();
});

it('should allow first fetch', async () => {
  fetchSandbox.mock(url, 'it worked');
  const fetch = rateLimited(fetchSandbox);

  const response = await fetch(url);
  expect(await response.text()).toEqual('it worked');
});

describe('when rate limit is reached', () => {
  let fetch, holds;
  beforeEach(async () => {
    const start = new clock.Date().getTime();
    holds = [];
    fetchSandbox.mock(url, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': start / 1000 + 1
      }
    });
    fetch = rateLimited(fetchSandbox, clock, (x) => holds.push(x));

    await fetch(url);
    fetchSandbox.mock(url, 'it worked');
  });

  it('should not call fetch prior to rate limit elapsing', async () => {
    let responseText = 'not yet';
    fetch(url)
      .then(response => response.text())
      .then(txt => {
          responseText = txt;
      });
    clock.tick(900);
    await fetchSandbox.flush(true);
    expect(responseText).toEqual('not yet');
    expect(holds).toEqual([true]);
  });
  it('should call fetch after rate limit has elapsed', async () => {
    const responsePromise = fetch(url);
    clock.tick(1000);
    const response = await responsePromise;
    expect(await response.text()).toEqual('it worked');
    expect(holds).toEqual([true, false]);
  });
});

it('should not hold fetch for expiry in the past', async () => {
  const start = new clock.Date().getTime();
  fetchSandbox.mock(url, {
    status: 200,
    headers: {
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': start / 1000 + 1
    }
  });
  const fetch = rateLimited(fetchSandbox, clock);

  await fetch(url); // set up expiry
  clock.tick(1000);

  fetchSandbox.mock(url, 'it worked');
  const response = await fetch(url);
  expect(await response.text()).toEqual('it worked');
});

