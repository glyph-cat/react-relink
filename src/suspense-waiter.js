// Modified based from ovieokeh's `wrapPromise` method. Reference:
// https://github.com/ovieokeh/suspense-data-fetching/blob/master/lib/api/wrapPromise.js

export function createSuspenseWaiter(promise) {
  let status = 1; // 0 = success; 1 = pending; 2 = error
  let res = null;
  let suspender = promise
    .then((r) => {
      status = 0;
      res = r;
    })
    .catch((e) => {
      status = 2;
      res = e;
    });

  return () => {
    switch (status) {
      case 1:
        throw suspender;
      case 2:
        throw res;
    }
  };
}
