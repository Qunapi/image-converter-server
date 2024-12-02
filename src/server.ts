import bodyParser from "body-parser";
import cors from "cors";
import express, { Request } from "express";
import https from "https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { db } from "./db/db.js";
import { imagesTable } from "./db/schema.js";
import { importRabbit } from "./rabbit.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const options = {
  key: fs.readFileSync(path.join(__dirname, "..", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "..", "cert.pem")),
};

const app = express();
const port = 443;

const server = https.createServer(options, app);

app.use(cors());

app.use(bodyParser.json());

app.get("/hello-world", (_req, res) => {
  res.send("Hello World!");
});

interface ConvertImageRequest {
  url: string;
  name: string;
}

app.get(
  "/api/images",
  async (_req: Request<unknown, unknown, ConvertImageRequest>, res) => {
    const results = await db.select().from(imagesTable);

    res.send({ data: results });
  },
);

const BUILD_PATH = "../../image-converter-client/dist";

app.use(express.static(path.join(__dirname, BUILD_PATH)));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, BUILD_PATH, "index.html"));
});

server.listen(port, () => {
  console.log("App listening on port: ", port);
});

importRabbit();
