function waitMilliseconds(ms, setTimeout) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export default function rateLimitedFetch(fetch, { setTimeout, Date: DateObject } = window, onHold) {
  let rateLimitExpiry = new DateObject().getTime();
  onHold = onHold || (() => {});

  async function waitForRateLimitExpiry() {
    const now = new DateObject().getTime();
    if(now < rateLimitExpiry) {
      onHold(true);
      await waitMilliseconds(rateLimitExpiry - now, setTimeout);
      onHold(false);
    }
  }

  return async function(...args) {
    await waitForRateLimitExpiry();

    let response = await fetch(...args);

    if(parseInt(response.headers.get('x-ratelimit-remaining')) === 0) {
      rateLimitExpiry = parseInt(response.headers.get('x-ratelimit-reset')) * 1000;
    }

    if(response.status === 403) {
      await waitForRateLimitExpiry();
      
      response = await fetch(...args);
    }

    return response;
  }
}
