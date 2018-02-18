import * as express from "express";
import { request, HttpMethod } from "../dist";
const app = express();

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

app.get("/posts", (_: express.Request, res: express.Response) => {
  const url = "http://jsonplaceholder.typicode.com/posts";
  request<Post[]>({ url, method: HttpMethod.Get }).then(response => {
    const userIds = response.map(u => u.userId);
    res.json({ userIds });
  });
});

app.listen(8080);
