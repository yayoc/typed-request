import * as http from "http";

export enum HttpMethod {
  Get = "get",
  Post = "post",
  Put = "put",
  Patch = "patch",
  Delete = "delete",
  Head = "head",
  Options = "options"
}

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: http.OutgoingHttpHeaders;
  query?: { [key: string]: string };
  body?: { [key: string]: string } | string;
  bodyValidator?: (body: Object) => boolean;
  responseProcessor?: <T>(body: Object) => T;
  errorProcessor?: (body: Object, error: Error) => Error;
  retryCount?: number;
  timeout?: number;
  outputCurlCommand?: boolean;
}

export function request<T>(config: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = http.request(config.url, res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => {
        body += chunk;
      });
      res.on("end", () => {
        let result = JSON.parse(body) as T;
        return resolve(result);
      });
    });
    req.on("error", e => {
      return reject(e);
    });
    req.end();
  });
}
