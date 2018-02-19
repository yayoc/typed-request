# typed-request

> A typed HTTP client for node.js.

## Features

* [x] Make a http request for NodeJS.
* [x] Returns a typed Promise with TypeScript Generic.
* [x] cURL command output
* [x] HTTP response validation
* [x] Process HTTP respnse / error
* [ ] Cancellation of request / Retring request
* [ ] Complete documentation

## Example

Type safe response with generic

```ts
import request from "typed-request";

interface User {
  id: number;
  name: string;
}

try {
  const users = await request<User[]>({
    url: "https://example.com/users"
  });
  const ids: number[] = users.map(u => u.id);
}
```

## APIs

Request can be made by passing `RequestConfig`

> request(config: RequestConfig);

```ts
const config = {
  url: "https://example.com/users",
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: "foo" })
};

const user: User = await request<User>(config);
```
### RequestConfig

#### url: string

#### method: HttpMethod

```ts
import { HttpMethod } from "typed-request";
{
  method: HttpMethod.Get;
}
```

#### headers: Object

```ts
{
  headers: {
    Authorization: "Bearer foo";
  }
}
```

#### body: Object

```ts
{
  body: {
    param0: "value0";
  }
}
```

#### query: Object

```ts
{
  query: {
    param0: "value0";
  }
}
```

#### auth: { username: string, password: string }

```ts
{
  auth: { username: "foo", password: "bar" }
}
```

#### bodyValidator: (body: Object) => boolean

If `bodyValidator` returns `false`, a request will return Promise reject immediately.

```ts
{
  bodyValidator: (body: Object) => body.length > 0;
}
```

#### responseProcessor: <T>(body: Object) => T

`responseProcessor` is a function which can process response data what you want with type definition.

#### errorProcessor: (body: Object, error: Error) => Error

`errorProcessor` is a function which can process error response which is returend as Promise reject.

#### retryCount: number

You can specify a number of retring requests.

#### timeout: number

If the request takes longer than timeout you specified, request should be aborted.
Default value is 1000.

#### outputCurlCommand: boolean

You can specify if output a cURL command for per request. True is default.

```ts
const config = {
  method: HttpMethod.Post,
  body: JSON.stringify({
    rating: 5,
    comment: "cool!"
  }),
  headers: {
    Authorization: "Bearer foo",
    "Content-Type": "application/json"
  }
};
request<Review>(config);
```

```console
curl -X POST -H "Authorization: Bearer foo" -H "Content-Type: application/json" -d '{"rating": 5, "comment": "cool!"}' http://somesite.com/some.json
```

### Cancellation

#### abort: () => void

```ts
const r = await request<User[]>({
  url: "https://example.com/users"
});
r.abort();
```
