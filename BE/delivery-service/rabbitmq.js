// rabbitmq.js
const amqp = require("amqplib");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "foodfast.events";
const EXCHANGE_TYPE = "topic";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";


// ======================================================
// 🔥 CONNECT + RETRY + AUTO-RECONNECT
// ======================================================
async function connectRabbitMQ(retries = 20, delay = 3000) {
  while (retries > 0) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);

      // Reconnect khi connection bị đóng
      connection.on("close", () => {
        console.error("[RabbitMQ] Connection closed. Reconnecting...");
        connection = null;
        channel = null;
        connectRabbitMQ().catch(() => {});
      });

      connection.on("error", (err) => {
        console.error("[RabbitMQ] Connection error:", err.message);
      });

      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true,
      });

      console.log("[RabbitMQ] Connected & Channel ready:", EXCHANGE_NAME);
      return channel;

    } catch (err) {
      console.error(`[RabbitMQ] Retry in ${delay / 1000}s...`, err.message);
      retries--;
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error("[RabbitMQ] Failed to connect after retries!");
}


// ======================================================
// 🔥 GET CHANNEL (tự động reconnect + retry)
// ======================================================
async function getChannel() {
  if (channel) return channel;
  return await connectRabbitMQ();
}


// ======================================================
// 🔥 PUBLISH EVENT
// ======================================================
async function publishEvent(routingKey, payload) {
  const ch = await getChannel();

  const message = {
    routingKey,
    payload,
    timestamp: new Date().toISOString(),
  };

  ch.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`[RabbitMQ] Published: ${routingKey}`, payload);
}


// ======================================================
// 🔥 SUBSCRIBE EVENT
// ======================================================
async function subscribeEvent(queueName, bindingKeys, handler) {
  const ch = await getChannel();

  if (!Array.isArray(bindingKeys)) bindingKeys = [bindingKeys];

  const q = await ch.assertQueue(queueName, { durable: true });

  for (const key of bindingKeys) {
    await ch.bindQueue(q.queue, EXCHANGE_NAME, key);
  }

  console.log(
    `[RabbitMQ] Subscribed: queue="${queueName}" keys=`,
    bindingKeys
  );

  ch.consume(q.queue, async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());
      await handler(content.payload, content);

      ch.ack(msg);
    } catch (err) {
      console.error("[RabbitMQ] Handler error:", err.message);
      ch.nack(msg, false, false);
    }
  });
}


module.exports = {
  publishEvent,
  subscribeEvent,
};
