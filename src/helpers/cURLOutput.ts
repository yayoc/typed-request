import * as http from "http";
import { HttpMethod, RequestConfig, getRequestBody } from "../";

export const getHttpMethod = (method: string = HttpMethod.Get): string => {
  return method.toUpperCase();
};

export const getHeaders = (input: any | undefined): string[] => {
  if (!input) return [];
  return Object.keys(input).map((key: string) => {
    const value: string = input[key];
    return `-H "${key}: ${value}"`;
  });
};

export const getCurlCommand = (
  input: http.ClientRequestArgs,
  body: RequestConfig["body"]
): string => {
  const method = getHttpMethod(input.method);
  const headers = getHeaders(input.headers);
  const url = `${input.protocol}//${input.hostname}${input.path}`;
  const bodyCommand = getRequestBody(body);

  return (
    `curl -X ${method} ` +
    (headers.length > 0 ? `${headers.join(" ")} ` : "") +
    (bodyCommand ? `-d '${bodyCommand}' ` : "") +
    `"${url}"`
  );
};
