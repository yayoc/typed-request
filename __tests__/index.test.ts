import { request, HttpMethod, buildUrl } from "../src";
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
