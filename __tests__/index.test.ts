import { request, HttpMethod, buildUrl, isHttps, getAuth } from "../src";
import * as url from "url";

describe("BuildUrl", () => {
  const u = "https//sample.com";
  let parsed;
  beforeEach(() => {
    parsed = url.parse(u);
  });
  it("should return a URL without queries", () => {
    expect(buildUrl(parsed.path)).toEqual(u);
  });

  it("should return a URL with queries", () => {
    const params = { key: "value" };
    expect(buildUrl(parsed.path, params)).toEqual(`${u}?key=value`);
  });
});

describe("isHttps", () => {
  it("should return true when passing https protocol", () => {
    const url = "https://sample.com";
    expect(isHttps(url)).toBe(true);
  });

  it("should return false when passing http protocol", () => {
    const url = "http://sample.com";
    expect(isHttps(url)).toBe(false);
  });
});

describe("getAuth", () => {
  it("should return auth string", () => {
    const params = { username: "foo", password: "bar" };
    expect(getAuth(params)).toEqual("foo:bar");
  });
});

describe("Cancelation", () => {
  it("should return false unless Promise is caceled", () => {
    const r = request<any>({
      url: "http://sample.com",
      method: HttpMethod.Get
    });
    expect(r.isCancelled()).toEqual(false);
  });

  it("should return true when Promise is caceled", () => {
    const r = request<any>({
      url: "http://sample.com",
      method: HttpMethod.Get
    });
    r.cancel();
    r.finally(() => {
      expect(r.isCancelled()).toEqual(true);
    });
  });
});
