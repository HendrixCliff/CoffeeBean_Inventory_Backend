const express = require('express');
const router = express.Router();

console.log("⚠️  Loading itemRoutes.js...");

const upload = require('../utils/multer');
const {
  createItem,
  consumeItem,
  getItem,
  getUserItems,
  deleteItem,
   getUniqueCategories,
   uploadReceipt,
   getReceipt
} = require('../controllers/itemController');
const { protect } = require("./../controllers/authController")

// ✅ Define routes properly
router.post('/', protect, upload.single('image'), createItem);
router.post(
  '/upload-receipt',
  protect,
  upload.single('receipt'),
  uploadReceipt
);

router.get(
  '/get-receipt',
  protect,
  getReceipt
);
router.patch('/:id/consume', protect, consumeItem);    // 🛠 give param a clear name
router.get('/', protect, getUserItems);
router.get('/filter', protect, getItem);
router.delete('/:id', protect, deleteItem);  
router.get('/categories', protect, getUniqueCategories);        // 🛠 clear param name

console.log("✅ itemRoutes.js loaded successfully");

module.exports = router; // ✅ Export AFTER routes are defined
