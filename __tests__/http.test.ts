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

  it("should request to local server successfuly", done => {
    server = http
      .createServer((req, res) => {
        res.end(JSON.stringify({ param: 0 }));
      })
      .listen(port, () => {
        let success = false;
        request({
          url: `http://localhost:${port}`,
          method: HttpMethod.Get,
          timeout: 200
        })
          .then(res => {
            success = true;
          })
          .catch(err => {
            console.log(err);
          });
        setTimeout(() => {
          expect(success).toBe(true);
          done();
        }, 300);
      });
  });

  it("should pass request body", done => {
    const data = {
      foo: "bar"
    };
    server = http
      .createServer((req, res) => {
        let body = "";
        req
          .on("error", error => {
            console.error(error);
          })
          .on("data", chunk => {
            body += chunk;
          })
          .on("end", () => {
            expect(body).toBe(JSON.stringify(data));
            done();
          });
        res.end(JSON.stringify({}));
      })
      .listen(port, () => {
        request({
          url: `http://localhost:${port}`,
          method: HttpMethod.Post,
          body: data
        });
      });
  });

  it("should return empty string", done => {
    server = http
      .createServer((req, res) => {
        res.end();
      })
      .listen(port, () => {
        request<string>({
          url: `http://localhost:${port}`,
          method: HttpMethod.Get
        }).then(res => {
          expect(res).toBe("");
          done();
        });
      });
  });

  describe("Tests body validator", () => {
    it("should return Promise.reject when bodyValidator returns false", () => {
      server = http
        .createServer((req, res) => {
          res.end();
        })
        .listen(port, () => {
          expect(
            request({
              url: `http://localhost:${port}`,
              method: HttpMethod.Get,
              bodyValidator: body => {
                return false;
              }
            })
          ).rejects.toEqual(new Error("Response body is not valid"));
        });
    });
  });
});
