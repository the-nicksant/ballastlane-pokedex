import { vi } from "vitest";

/**
 * Mock fetch for API calls
 */
export function mockFetch(responses: Map<string, any>) {
  global.fetch = vi.fn((url: string | URL | Request, options?: RequestInit) => {
    const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
    const key = `${options?.method || "GET"} ${urlString}`;
    const mockResponse = responses.get(key);

    if (!mockResponse) {
      return Promise.reject(new Error(`No mock response for ${key}`));
    }

    return Promise.resolve({
      ok: mockResponse.status >= 200 && mockResponse.status < 300,
      status: mockResponse.status,
      json: async () => mockResponse.body,
      headers: new Headers(mockResponse.headers || {}),
    } as Response);
  });
}

/**
 * Reset fetch mock
 */
export function resetFetchMock() {
  if (global.fetch && vi.isMockFunction(global.fetch)) {
    (global.fetch as any).mockClear();
  }
}

/**
 * Mock Next.js router
 */
export function mockNextRouter(overrides: Partial<any> = {}) {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    ...overrides,
  };

  vi.mock("next/navigation", () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockRouter.pathname,
    useSearchParams: () => new URLSearchParams(),
  }));

  return mockRouter;
}

/**
 * Create a mock NextRequest
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {}
): Request {
  const { method = "GET", body, headers = {}, cookies = {} } = options;

  const request = new Request(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  // Mock cookies
  (request as any).cookies = {
    get: (name: string) => {
      const value = cookies[name];
      return value ? { name, value } : undefined;
    },
    set: vi.fn(),
    delete: vi.fn(),
  };

  return request;
}

/**
 * Mock Next.js cookies
 */
export function mockNextCookies(cookieStore: Record<string, string> = {}) {
  vi.mock("next/headers", () => ({
    cookies: async () => ({
      get: (name: string) => {
        const value = cookieStore[name];
        return value ? { name, value } : undefined;
      },
      set: vi.fn((name: string, value: string) => {
        cookieStore[name] = value;
      }),
      delete: vi.fn((name: string) => {
        delete cookieStore[name];
      }),
    }),
  }));

  return cookieStore;
}

/**
 * Extract response body from NextResponse
 */
export async function getResponseBody(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
