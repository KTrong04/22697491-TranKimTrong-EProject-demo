const amqp = require("amqplib");
const config = require("../config");
const OrderService = require("../services/orderService");

class MessageBroker {
  static async connect() {
    try {
      const connection = await amqp.connect(config.rabbitMQURI);
      const channel = await connection.createChannel();

      // Declare the order queue
      await channel.assertQueue(config.rabbitMQQueue, { durable: true });

      // Consume messages from the order queue on buy
      channel.consume(config.rabbitMQQueue, async (message) => {
        try {
          const order = JSON.parse(message.content.toString());
          const orderService = new OrderService();
          const savedOrder = await orderService.createOrder(order);

          console.log("✅ Order processed:", savedOrder);

          // 🔹 Sau khi lưu đơn hàng, publish ngược lại cho product-service
          const responseQueue = "products"; // tên queue bên product-service đang listen
          const responseMessage = {
            orderId: order.orderId,
            status: "completed",
            products: order.products,
            username: order.username,
            totalPrice: order.totalPrice || 0,
          };


          await channel.assertQueue(responseQueue, { durable: true });
          channel.sendToQueue(responseQueue, Buffer.from(JSON.stringify(responseMessage)), {
            persistent: true,
          });

          channel.ack(message);
        } catch (error) {
          console.error("❌ Error processing order:", error);
          channel.reject(message, false);
        }
      });

    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = MessageBroker;
