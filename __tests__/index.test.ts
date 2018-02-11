import { request, HttpMethod } from "../src";

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
