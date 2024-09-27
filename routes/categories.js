const express = require("express");
const router = express.Router();
const Category = require("../models/categories");
const Test = require("../models/test");




router.get('/total', async (req, res) => {
  try {
    const count = await Category.countDocuments();
    res.json({ totalCat: count });
  } catch (err) {
    console.error('Error fetching Category tests:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





router.post("/", async (req, res) => {
  const { categories } = req.body;

  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ message: "Categories are required and must be an array." });
  }

  try {
    const savedCategories = [];
    for (const categoryData of categories) {
      const { name, timeLimit } = categoryData;

      if (!name || !timeLimit) {
        return res.status(400).json({ message: "Name and timeLimit are required fields." });
      }

      const category = new Category({ name, timeLimit });
      await category.save();
      savedCategories.push(category);
    }

    res.status(201).json(savedCategories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("questions");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/all', async (req, res) => {
  try {
    const result = await Category.deleteMany({});
    res.status(200).json({ message: 'All categories deleted successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting categories', error });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const test = await Category.findById(id) ;
    if (!test) {
      return res.status(404).json({ message: 'category not found' });
    }
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { name, timeLimit } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, timeLimit },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET route to find the test by category ID
router.get('/test-by-category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Find the test that includes the given category ID
    const test = await Test.findOne({ 'categories': categoryId });

    // Check if a test was found
    if (!test) {
      return res.status(404).json({ message: 'Test with the specified category not found' });
    }

    // Return the test ID
    res.json({ testId: test._id });
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
