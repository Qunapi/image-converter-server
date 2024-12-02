import amqplib from "amqplib";
import { eq } from "drizzle-orm";
import { Status } from "./constants.js";
import { db } from "./db/db.js";
import { imagesTable } from "./db/schema.js";

export function importRabbit() {}

const connection = await amqplib.connect(process.env.RABBIT_MQ_URL!);

const toCompleteChannel = await connection.createChannel();

const COMPLETED_IMAGES_QUEUE = "completed-images";
const completedChannel = await connection.createChannel();

completedChannel.consume(
  COMPLETED_IMAGES_QUEUE,
  async (msg) => {
    if (msg === null) return;

    console.log("Received message: ", msg);

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

    console.log("Successfully handled the message: ", msg);
  },
  { noAck: true },
);

const IMAGES_TO_PROCESS_EXCHANGE = "images-to-process-exchange";

const { queue } = await toCompleteChannel.assertQueue("", {
  exclusive: true,
});

await toCompleteChannel.assertExchange(IMAGES_TO_PROCESS_EXCHANGE, "fanout", {
  durable: false,
});

toCompleteChannel.bindQueue(queue, IMAGES_TO_PROCESS_EXCHANGE, "");

toCompleteChannel.consume(
  queue,
  async (msg) => {
    if (msg === null) return;

    const message = JSON.parse(msg.content.toString());

    const fileName = message.fileName;

    const imageUrl = `${process.env.IMAGE_BASE_URL}${fileName}`;

    await db.insert(imagesTable).values({
      name: fileName,
      status: Status.Processing,
      url: imageUrl,
    });

    console.log(
      "Successfully handled IMAGES_TO_PROCESS_EXCHANGE message: ",
      msg,
    );
  },
  { noAck: true },
);
