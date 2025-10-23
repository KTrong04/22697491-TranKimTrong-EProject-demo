const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [{
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String }
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  username: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
