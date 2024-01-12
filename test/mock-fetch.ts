/**
 * Extremely simple mock of the fetch method
 */
export class MockFetch {
  lastRequest: RequestInfo | undefined;
  lastInit: RequestInit | undefined;
  nextResponse = new Response(`{"value":[{}]}`, { status: 200 });
  fetch(request: RequestInfo, options: RequestInit) {
    this.lastRequest = request;
    this.lastInit = options;
    return Promise.resolve(this.nextResponse);
  }
}
