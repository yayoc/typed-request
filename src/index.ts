import * as http from "http";
import * as url from "url";
import * as Promise from "bluebird";

Promise.config({
  cancellation: true
});

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

const getRequestArgs = (config: RequestConfig): http.ClientRequestArgs => {
  const parsed = url.parse(config.url);
  return Object.assign(
    {
      hostname: parsed.hostname,
      port: parsed.port,
      path: buildUrl(parsed.path!, config.query),
      method: config.method
    },
    config.headers ? { headers: config.headers } : null,
    config.timeout ? { timeout: config.timeout } : null
  );
};

export const buildUrl = (
  path: string,
  query?: { [key: string]: string }
): string => {
  if (!query) {
    return path;
  }
  return `${path}?${Object.keys(query)
    .map(k => `${k}=${query[k]}`)
    .join("&")}`;
};

const getRequsetBody = (config: RequestConfig): any => {};

export function request<T>(config: RequestConfig): Promise<T> {
  return new Promise<T>((resolve, reject, onCancel) => {
    const args = getRequestArgs(config);
    const req = http.request(args, res => {
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

    req.on("abort", e => {
      return reject(e);
    });
    // Cancellation
    if (onCancel) {
      onCancel(() => {
        req.abort();
      });
    }
    req.end();
  });
}
