import { request, HttpMethod } from "../src";
import * as http from "http";

describe("Test actual requests", () => {
  let server;
  const port = 8888;
  afterEach(() => {
    if (server) {
      server.close();
      server = null;
    }
  });

  it("should request to local server successfuly", () => {
    server = http
      .createServer((req, res) => {
        res.end();
      })
      .listen(port, () => {
        let success = false;
        request({
          url: `http://localhost:${port}`,
          method: HttpMethod.Get
        }).then(res => {
          success = true;
        });
        setTimeout(() => {
          expect(success).toBe(true);
        });
      });
  });
});
