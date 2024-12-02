import amqplib from "amqplib";
import { MessageType, Status } from "../constants.js";
import { db } from "../db/db.js";
import { imagesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

amqplib.connect("amqp://localhost", function () {});

const connection = await amqplib.connect("amqp://localhost");

const IMAGES_TO_PROCESS_QUEUE = "images-to-process";
const toCompleteChannel = await connection.createChannel();

toCompleteChannel.assertQueue(IMAGES_TO_PROCESS_QUEUE, {
  durable: false,
});

export function publishNewImageAdded(url: string, name: string) {
  const payload = { url, name, type: MessageType.RawImageAdded };
  toCompleteChannel.sendToQueue(
    IMAGES_TO_PROCESS_QUEUE,
    Buffer.from(JSON.stringify(payload)),
  );
}

toCompleteChannel.assertQueue(IMAGES_TO_PROCESS_QUEUE, {
  durable: false,
});

const COMPLETED_IMAGES_QUEUE = "completed-images";
const completedChannel = await connection.createChannel();

completedChannel.consume(COMPLETED_IMAGES_QUEUE, async (msg) => {
  if (msg === null) return;

  const payload = JSON.parse(msg.content.toString());

  const { processedName, name } = payload;

  const imageUrl = `${process.env.IMAGE_BASE_URL}${processedName}`;

  await db
    .update(imagesTable)
    .set({
      processedUrl: imageUrl,
      status: Status.Success,
    })
    .where(eq(imagesTable.name, name));
});
