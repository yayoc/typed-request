import {
  getHttpMethod,
  getHeaders,
  getCurlCommand
} from "../../src/helpers/cURLOutput";

describe("getHttpMethod", () => {
  it("should return upper case http method", () => {
    expect(getHttpMethod("post")).toEqual("POST");
  });
});

describe("getHeaders", () => {
  it("should return an empty array when input is undefined", () => {
    expect(getHeaders(undefined)).toEqual([]);
  });

  it("should return cURL headers", () => {
    const headers = {
      Authorization: "Bearer foo"
    };
    expect(getHeaders(headers)).toEqual(['-H "Authorization: Bearer foo"']);
  });
});

describe("getCurlCommand", () => {
  it("should return cURL comand for get method", () => {
    const input = {
      protocol: "https:",
      hostname: "someapi.com",
      port: null,
      path: "/",
      method: "get"
    };
    expect(getCurlCommand(input, undefined)).toEqual(
      'curl -X GET "https://someapi.com/"'
    );
  });

  it("should return cURL command for post method", () => {
    const input = {
      protocol: "https:",
      hostname: "someapi.com",
      port: null,
      path: "/",
      method: "post"
    };
    const body = JSON.stringify({
      foo: "bar"
    });

    expect(getCurlCommand(input, body)).toEqual(
      'curl -X POST -d \'{\"foo\":\"bar\"}\' "https://someapi.com/"'
    );
  });
});
