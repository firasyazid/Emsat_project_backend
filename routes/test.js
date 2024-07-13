const express = require('express');
const router = express.Router();
const Test = require('../models/test');  
const Category = require('../models/categories');  


router.post('/', async (req, res) => {
  const { name, categories } = req.body;

   try {
    const existingCategories = await Category.find({ _id: { $in: categories } }).lean();
    const existingCategoryIds = existingCategories.map(cat => cat._id.toString());

     const invalidCategoryIds = categories.filter(id => !existingCategoryIds.includes(id));

    if (invalidCategoryIds.length > 0) {
      return res.status(400).json({ message: `Invalid category IDs: ${invalidCategoryIds.join(', ')}` });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
   try {
    const test = new Test({ name, categories });
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// GET route to fetch all Test documents
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find().populate('categories');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
