const express = require('express');
const router = express.Router();
const {Test} = require('../models/test');  
const {Question} = require('../models/questions');

 router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Test name is required' });
  }

  try {
    const newTest = new Test({ name });
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/', async (req, res) => {
    try {
        const tests = await Test.find();
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    }
);

router.post('/assign/:testId', async (req, res) => {
    const { testId } = req.params;
    const { questionId } = req.body;
  
    try {
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
  
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
  
       test.questions.push(questionId);
      await test.save();
  
       const populatedTest = await Test.findById(testId).populate('questions').exec();
  
      res.status(200).json(populatedTest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  



module.exports = router;
