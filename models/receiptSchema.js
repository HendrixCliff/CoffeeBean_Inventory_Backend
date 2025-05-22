const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  receiptUrl: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Receipt', receiptSchema);
