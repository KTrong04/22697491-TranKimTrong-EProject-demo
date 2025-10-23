require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://rabbitmq/orders',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://rabbitmq',
    rabbitMQQueue: 'orders',
    port: 3002
};
  