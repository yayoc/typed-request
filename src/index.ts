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
  auth?: AuthParams;
  bodyValidator?: (body: Object) => boolean;
  responseProcessor?: <T>(body: Object) => T;
  errorProcessor?: (body: Object, error: Error) => Error;
  retryCount?: number;
  timeout?: number;
  outputCurlCommand?: boolean;
}

export interface AuthParams {
  username: string;
  password: string;
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
    config.timeout ? { timeout: config.timeout } : null,
    config.auth ? { auth: getAuth(config.auth) } : null
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

export const getAuth = (params: AuthParams): string => {
  return `${params.username}:${params.password}`;
};

export const isHttps = (u: string): boolean => {
  const parsed = url.parse(u);
  return parsed.protocol === "https:";
};

export const transformResponse = (data: any): any => {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      /* Ignore */
    }
  }
  return data;
};

export function request<T>(config: RequestConfig): Promise<T> {
  return new Promise<T>((resolve, reject, onCancel) => {
    const args = getRequestArgs(config);
    const req = http.request(args, res => {
      let responseBody = "";
      res.setEncoding("utf8");
      res.on("data", chunk => {
        responseBody += chunk;
      });
      res.on("end", () => {
        let response = transformResponse(responseBody) as T;
        return resolve(response);
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

    if (config.body) {
      req.write(JSON.stringify(config.body));
    }
    req.end();
  });
}
