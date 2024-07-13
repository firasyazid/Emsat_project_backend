const {Question} = require("../models/questions");
const express = require("express");
const router = express.Router();
 const Category = require('../models/categories');


router.get('/', async (req, res) => {
    try {
      const questions = await Question.find();
      res.json(questions);
    }
    catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

   //multiple choice
  router.post('/multiple-choice', async (req, res) => {
    const { text, options, correctAnswer, categoryId } = req.body;
  
    if (!text || !options || !correctAnswer || !categoryId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
       const category = await Category.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
       const newQuestion = new Question({
        type: 'multipleChoice',
        text,
        multipleChoiceData: {
          options,
          correctAnswer
        },
        category: category._id  
      });
  
      const savedQuestion = await newQuestion.save();
  
       const populatedQuestion = await Question.findById(savedQuestion._id).populate('category', 'name');
  
      res.status(201).json(populatedQuestion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
   
///// drag & drop 

router.post('/drag-and-drop', async (req, res) => {
    const { text, draggableItems, correctSequence } = req.body;
  
    const newQuestion = new Question({
      type: 'dragAndDrop',
      text,
      dragAndDropData: {
        draggableItems,
        correctSequence
      }
    });
  
    try {
      const savedQuestion = await newQuestion.save();
      res.status(201).json(savedQuestion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  ///assign question to category


  router.post('/', async (req, res) => {
    const { type, text, category: categoryId, multipleChoiceData, dragAndDropData } = req.body;
    try {
       const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
  
      // Create new Question document
      const question = new Question({
        type,
        text,
        category: categoryId,
        multipleChoiceData,
        dragAndDropData
      });
  
      // Save question
      await question.save();
  
      // Assign question to category
      category.questions.push(question._id);
      await category.save();
  
      res.status(201).json(question);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
 
    
  module.exports = router;