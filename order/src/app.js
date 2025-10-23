const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

class App {
  constructor() {
    this.app = express();
    this.app.use(express.json()); // ✅ Cho phép parse JSON body
  }

  async init() {
    await this.connectDB();
    await this.setupOrderConsumer();
  }

  async connectDB() {
    try {
      await mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected (order-service)");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async setupOrderConsumer() {
    console.log("🔄 Waiting to connect to RabbitMQ...");

    const amqpServer = config.rabbitMQURI || "amqp://rabbitmq:5672";

    // Retry logic: thử kết nối tối đa 10 lần, mỗi lần cách 5s
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const connection = await amqp.connect(amqpServer);
        const channel = await connection.createChannel();

        await channel.assertQueue(config.rabbitMQQueue, { durable: true });
        console.log("✅ Connected to RabbitMQ (order-service)");

        channel.consume(config.rabbitMQQueue, async (data) => {
          try {
            console.log("📩 Received order message");

            let { products, username, orderId } = JSON.parse(data.content.toString());

            // ép về mảng nếu products là string
            if (!Array.isArray(products)) {
              products = [products];
            }

            // nếu là mảng ID (không có price), thì chỉ lưu ID thôi, không reduce lỗi
            const totalPrice = Array.isArray(products)
              ? products.reduce((acc, product) => {
                if (typeof product === "object" && product.price) {
                  return acc + product.price;
                }
                return acc;
              }, 0)
              : 0;

            const newOrder = new Order({
              products, // giờ là mảng object có đủ info
              username,
              totalPrice,
            });


            await newOrder.save();
            console.log("✅ Order saved:", newOrder._id);

            // phản hồi đầy đủ cho product-service
            const response = {
              orderId,
              status: "completed",
              username,
              products: newOrder.products, // lấy đúng từ DB
              totalPrice: newOrder.totalPrice,
            };

            await channel.assertQueue("products", { durable: true });
            channel.sendToQueue("products", Buffer.from(JSON.stringify(response)));

            channel.ack(data);
            console.log("📤 Response sent back to product-service");
          } catch (err) {
            console.error("❌ Error processing order:", err);
            channel.nack(data, false, false); // Không requeue, tránh vòng lặp vô hạn
          }
        });


        return; // ✅ kết nối thành công, thoát vòng lặp retry
      } catch (err) {
        console.warn(`⚠️ RabbitMQ not ready (attempt ${attempt}/10). Retrying in 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    console.error("❌ Failed to connect to RabbitMQ after 10 attempts");
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`🚀 Order service running on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("🛑 Order service stopped");
  }
}

module.exports = App;
