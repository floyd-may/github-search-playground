import React from 'react';

// a little React component that just runs its 
// render prop. Useful for getting the data that
// a hook returns.
export function OnRender({ render }) {
  if(render) {
    render();
  }

  return null;
}

// returns a promise that resolves after
// trampolining via setTimeout
export function nextTick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
