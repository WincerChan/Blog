import { describe, expect, test } from "bun:test";
import { createTracker } from "../packages/inkstone-track/src/index";

const createEnv = () => {
  const calls: string[] = [];
  const fetchImpl = async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push(url);
    return new Response(null, { status: 204 });
  };
  const doc = {
    visibilityState: "visible",
    referrer: "https://ref.example.com/",
    addEventListener: () => undefined,
  } as Document;
  const nav = {} as Navigator;
  const loc = {
    hostname: "example.com",
    pathname: "/posts/hello/",
  } as Location;
  return { calls, fetchImpl, doc, nav, loc };
};

describe("inkstone tracker", () => {
  test("skips when token missing", () => {
    const env = createEnv();
    const tracker = createTracker({
      baseUrl: "https://inkstone.example.com",
      siteHost: "example.com",
      isDev: false,
      fetch: env.fetchImpl,
      document: env.doc,
      navigator: env.nav,
      location: env.loc,
    });
    tracker.trackPage("/posts/hello/", "");
    expect(env.calls.length).toBe(0);
  });

  test("sends pulse pv and engage with token", () => {
    const env = createEnv();
    const tracker = createTracker({
      baseUrl: "https://inkstone.example.com",
      siteHost: "example.com",
      isDev: false,
      fetch: env.fetchImpl,
      document: env.doc,
      navigator: env.nav,
      location: env.loc,
    });
    tracker.trackPage("/posts/hello/", "token-123");
    tracker.trackEngage();
    expect(env.calls[0]).toContain("/v2/pulse/pv");
    expect(env.calls[0]).toContain("inkstone_token=token-123");
    expect(env.calls[1]).toContain("/v2/pulse/engage");
  });

  test("skips when siteHost mismatch in prod", () => {
    const env = createEnv();
    env.loc.hostname = "other.com";
    const tracker = createTracker({
      baseUrl: "https://inkstone.example.com",
      siteHost: "example.com",
      isDev: false,
      fetch: env.fetchImpl,
      document: env.doc,
      navigator: env.nav,
      location: env.loc,
    });
    tracker.trackPage("/posts/hello/", "token-123");
    expect(env.calls.length).toBe(0);
  });
});
