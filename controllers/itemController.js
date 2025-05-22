const asyncErrorHandler = require("./../utils/asyncErrorHandler")
const Item = require('../models/itemSchema')
const AuditLog = require("./../models/auditSchema")
const Receipt = require('../models/receiptSchema');

    exports.createItem = asyncErrorHandler(async (req, res) => {
      // ✅ 1. Validate user presence (for extra safety)
      console.log("User session:", req.user);
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
      const { name, category, capitalPrice, sellingPrice, quantity } = req.body

    // ✅ 2. Prepare item data
      const itemData = {
        name: name,
        category: category,
        capitalPrice: capitalPrice,
        sellingPrice: sellingPrice,
        quantity: quantity,
        used: 0, // 👈 default usage value
       image: req.file ? req.file.path : null,
        owner: req.user._id
      };

      // ✅ 3. Save item to database
      const newItem = await Item.create(itemData);

      // ✅ 4. Respond with success
      res.status(201).json({
        status: 'success',
        data: newItem
      });
    });

    // PUT /items/:id/consume
    exports.consumeItem = asyncErrorHandler(async (req, res) => {
      const { id } = req.params;
      const { amountUsed } = req.body;
    
      // Validate input
      if (!amountUsed || amountUsed <= 0) {
        return res.status(400).json({ message: "Invalid amount to consume" });
      }
    
      // Find item
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
    
      // Check ownership (optional, but strongly recommended)
      if (item.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to modify this item" });
      }
    
      // Validate consumption
      const remaining = item.quantity - item.used;
      if (amountUsed > remaining) {
        return res.status(400).json({ message: "Not enough quantity left to consume that amount" });
      }
    
      // Update and save
      item.used += amountUsed;
      await item.save();
    
      // Audit log
      await AuditLog.create({
        user: req.user._id,
        action: 'SELL',
        item: item.toObject(),
        metadata: { amountUsed }
      });
    
      res.status(200).json({
        message: `${amountUsed} unit(s) sold`,
        remaining: item.quantity - item.used,
        data: item
      });
    });
    

     // controllers/itemController.js

exports.getUniqueCategories = async (req, res) => {
  try {
    const categories = await Item.distinct('category');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};


exports.getItem = asyncErrorHandler(async (req, res) => {
  try {
    const { category, from, to, minUsed, maxUsed } = req.query;

    // 🔍 1. Build filters for live items
    const itemFilters = {};
    if (req.user) itemFilters.owner = req.user._id;
    if (category) itemFilters.category = category;
    if (from || to) {
      itemFilters.datePurchased = {};
      if (from) itemFilters.datePurchased.$gte = new Date(from);
      if (to) itemFilters.datePurchased.$lte = new Date(to);
    }

    // 🔍 2. Build filters for historical items in AuditLog
    const logFilters = { user: req.user._id, action: { $in: ['DELETE', 'CONSUME'] } };

    if (category) logFilters['item.category'] = category;
    if (from || to) {
      logFilters.timestamp = {};
      if (from) logFilters.timestamp.$gte = new Date(from);
      if (to) logFilters.timestamp.$lte = new Date(to);
    }
    if (minUsed || maxUsed) {
      logFilters['item.used'] = {};
      if (minUsed) logFilters['item.used'].$gte = Number(minUsed);
      if (maxUsed) logFilters['item.used'].$lte = Number(maxUsed);
    }

      if (req.query.action) {
      logFilters.action = req.query.action;
    }

    // 📦 3. Query both collections
    const [items, logs] = await Promise.all([
      Item.find(itemFilters).sort({ datePurchased: -1 }),
       AuditLog.find(logFilters).sort({ timestamp: -1 })
    ]);

    // ⚙️ 4. Format active items
    const active = items.map(item => ({
      ...item.toObject(),
      remaining: item.quantity - item.used,
      deleted: false
    }));

    // ⚙️ 5. Format deleted/consumed items from logs
    const deleted = logs.map(log => ({
      ...log.item,
      remaining: log.item.quantity - log.item.used,
      deleted: true,
      deletedAt: log.timestamp,
      action: log.action,
      metadata: log.metadata
    }));

    // 🧩 6. Combine and return
    const allItems = [...active, ...deleted];

    res.status(200).json({
      status: 'success',
      counts: logs.length,
      data: allItems
    });
  } catch (err) {
    console.error('Error in getItem:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

      
exports.getUserItems = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id;

  const items = await Item.find({ owner: userId }).sort({ createdAt: -1 });

  const formattedItems = items.map(item => ({
    _id: item._id,
    name: item.name,
    category: item.category,
    capitalPrice: item.capitalPrice,
    sellingPrice: item.sellingPrice,
    quantity: item.quantity,
    used: item.used,
    datePurchased: item.datePurchased,
    image: item.image ?? null,
    owner: item.owner,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
    // ❌ removed "remaining" — it's now handled in UI
  }));

  res.status(200).json({
    status: 'success',
    message: 'User items retrieved successfully',
    count: formattedItems.length,
    data: formattedItems,
  });
});

exports.deleteItem = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const item = await Item.findById(id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.owner.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'You are not authorized to delete this item' });
  }

  await AuditLog.create({
    user: req.user._id,
    action: 'DELETE',
    item: item.toObject()
  });
  
  await item.deleteOne();

  res.status(200).json({ message: 'Item deleted successfully', id });
})

exports.uploadReceipt = asyncErrorHandler(async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  const receipt = new Receipt({
    title,
    receiptUrl: req.file.path,
    user: req.user._id
  });

  await receipt.save();

  res.status(201).json({
    message: 'Receipt uploaded successfully',
    receiptId: receipt._id,
    title: receipt.title,
    receiptUrl: receipt.receiptUrl
  });
});

exports.getReceipt = asyncErrorHandler(async (req, res) => {
  const receipts = await Receipt.find({ user: req.user._id }).sort({ uploadedAt: -1 });

  res.status(200).json({
    message: 'Receipts fetched successfully',
    count: receipts.length,
    receipts: receipts.map(r => ({
      receiptId: r._id,
      title: r.title,
      receiptUrl: r.receiptUrl,
      uploadedAt: r.uploadedAt
    }))
  });
});

