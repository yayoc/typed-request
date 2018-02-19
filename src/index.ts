import * as http from "http";
import * as https from "https";
import * as url from "url";
import * as Promise from "bluebird";
import { getCurlCommand } from "./helpers/cURLOutput";
import chalk from "chalk";

const log = console.log;
const info = (message: string) => log(chalk.green(message));

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
  responseProcessor?: <T>(response: any) => T;
  errorProcessor?: (body: Object, error: Error) => Error;
  retryCount?: number;
  timeout?: number;
  outputCurlCommand?: boolean;
}

export interface AuthParams {
  username: string;
  password: string;
}

export const getRequestArgs = (
  config: RequestConfig
): http.ClientRequestArgs => {
  const parsed = url.parse(config.url);
  return Object.assign(
    {
      protocol: parsed.protocol,
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

export const parseResponse = (data: string): any => {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      /* Ignore */
    }
  }
  return data;
};

export const getRequestBody = (body: RequestConfig["body"]): string => {
  if (!body) return "";
  return typeof body === "string" ? body : JSON.stringify(body);
};

interface H {
  request(options: http.RequestOptions | string | URL, callback?: (res: http.IncomingMessage) => void): http.ClientRequest
}

export function request<T = any>(config: RequestConfig): Promise<T> {
  return new Promise<T>((resolve, reject, onCancel) => {
    const args = getRequestArgs(config);
    if (config.outputCurlCommand) {
      const command = getCurlCommand(args, config.body);
      info(command);
    }
    const h: H = isHttps(config.url) ? https : http;
    const req = h.request(args, res => {
      let responseBody = "";
      res.setEncoding("utf8");
      res.on("data", chunk => {
        responseBody += chunk;
      });
      res.on("end", () => {
        let response = parseResponse(responseBody) as T;
        if (config.bodyValidator && !config.bodyValidator(response)) {
          return reject(new Error("Response body is not valid"));
        }
        if (config.responseProcessor) {
          response = config.responseProcessor<T>(response);
        }
        return resolve(response);
      });
    });
    req.on("error", e => {
      if (config.retryCount && config.retryCount > 0) {
        const retryCount = config.retryCount - 1;
        return request<T>({ ...config, retryCount });
      }
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

    const requestBody = getRequestBody(config.body);
    if (requestBody) {
      req.write(requestBody);
    }
    req.end();
  });
}