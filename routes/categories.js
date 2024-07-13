const express = require('express');
const router = express.Router();
const Category = require('../models/categories');  

router.post('/', async (req, res) => {
  const { name, timeLimit, questions } = req.body;

   if (!name || !timeLimit) {
    return res.status(400).json({ message: 'Name and timeLimit are required fields.' });
  }

   try {
    const category = new Category({ name, timeLimit });
    if (questions) {
      category.questions = questions;
    }

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().populate('questions');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
