const express = require("express");
const router = express.Router();
const { Category } = require("../models/questions");

router.post('/', async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).send('Category name is required');
    }
  
    try {
      const category = new Category({ name });
      await category.save();
      res.status(201).send(category);
    } catch (error) {
      if (error.code === 11000) {
         return res.status(400).send('Category name must be unique');
      }
      res.status(500).send('Server error');
    }
  });


router.get('/', async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  module.exports = router;
