require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  mongoURI: process.env.MONGODB_PRODUCT_URI || "mongodb://localhost/products",
  rabbitMQURI: process.env.RABBITMQ_URI || "amqp://127.0.0.1:5672", // <- quan trọng
  exchangeName: "products",
  queueName: "products_queue",
};
