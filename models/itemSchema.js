const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  capitalPrice: {
    type: Number,
  },
  sellingPrice: {
    type: Number,
  },
  quantity: Number,
  used: {
    type: Number,
    default: 0
  },
   receiptUrl: {
    type: String,
    default: null // Optional, but good for clarity
  },
  datePurchased: {
    type: Date,
    default: Date.now // ⬅️ Automatically set when created
  },
  image: {
    type: String, // filename or URL
    default: null
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, {
  timestamps: true // <-- This adds createdAt and updatedAt
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
