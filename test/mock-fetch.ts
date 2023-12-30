/**
 * Extremely simple mock of the fetch method
 */
export class MockFetch {
  lastRequest: RequestInfo | undefined;
  lastInit: RequestInit | undefined;
  fetch(request: RequestInfo, options: RequestInit) {
    this.lastRequest = request;
    this.lastInit = options;
    return Promise.resolve(new Response(`{"value":[{}]}`, { status: 200 }));
  }
}
