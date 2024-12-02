import amqplib from "amqplib";

const connection = await amqplib.connect("amqp://localhost");

const toCompleteChannel = await connection.createChannel();

const IMAGES_TO_PROCESS_EXCHANGE = "images-to-process-exchange";

toCompleteChannel.assertExchange(IMAGES_TO_PROCESS_EXCHANGE, "fanout", {
  durable: false,
});

const key = "image-4.3.jpg";

const payload = { fileName: key };

await toCompleteChannel.publish(
  IMAGES_TO_PROCESS_EXCHANGE,
  "",
  Buffer.from(JSON.stringify(payload)),
);

console.log("Success! published", payload);
