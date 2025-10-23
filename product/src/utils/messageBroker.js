const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.channel = null;
    this.connection = null;
  }

  async connect() {
    if (this.channel) return this.channel; // tránh kết nối lại nhiều lần

    try {
      console.log("Connecting to RabbitMQ...");
      this.connection = await amqp.connect("amqp://rabbitmq:5672");
      this.channel = await this.connection.createChannel();
      console.log("✅ RabbitMQ connected (product-service)");
      return this.channel;
    } catch (err) {
      console.error("❌ Failed to connect to RabbitMQ:", err.message);
      throw err;
    }
  }

  async publishMessage(queue, message) {
    const channel = await this.connect();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  }

  async consumeMessage(queue, callback) {
    const channel = await this.connect();
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        callback(data);
        channel.ack(msg);
      }
    });

    console.log(`📥 Listening on queue: ${queue}`);
  }
}

module.exports = new MessageBroker();
