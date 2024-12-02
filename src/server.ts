import express, { Request } from "express";
import bodyParser from "body-parser";
import { Status } from "./constants.js";
import { db } from "./db/db.js";
import { imagesTable } from "./db/schema.js";
import { publishNewImageAdded } from "./rabbit/rabbit.js";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

interface ConvertImageRequest {
  url: string;
  name: string;
}

app.post(
  "/convert",
  async (req: Request<unknown, unknown, ConvertImageRequest>, res) => {
    const { url, name } = req.body;

    await db
      .insert(imagesTable)
      .values({ name, url, status: Status.Processing });

    publishNewImageAdded(url, name);

    res.send("Hello World!");
  },
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
