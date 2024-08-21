const express = require('express');
const router = express.Router();  
const Test = require("../models/test");
const Category = require("../models/categories");
const mongoose = require('mongoose');  
const { Question } = require('../models/questions'); 


router.post('/:testId/submit', async (req, res) => {
  const { testId } = req.params;
  const { userId, answers } = req.body;

  try {
      // Find the test by its ID and populate categories and their questions
      const test = await Test.findById(testId)
          .populate({
              path: 'categories',
              populate: {
                  path: 'questions'
              }
          });

      if (!test) {
          return res.status(404).json({ message: 'Test not found' });
      }

      // Log the populated test object for debugging
      console.log('Populated Test Object:', JSON.stringify(test, null, 2));

      // Define a function to validate answers
      const validateAnswer = (question, answer) => {
          switch (question.type) {
              case 'singleChoice':
                  return question.singleChoiceData.correctAnswer === answer;
              case 'multipleChoice':
                  return answer.sort().toString() === question.multipleChoiceData.correctAnswers.sort().toString();
              case 'dragAndDrop':
                  return question.dragAndDropData.correctSequence.join('') === answer.join('');
              default:
                  return false;
          }
      };

      // Process user answers
      const results = answers.map(answer => {
          const question = test.categories.flatMap(cat => cat.questions)
              .find(q => q._id.toString() === answer.questionId);

          if (!question) {
              return { questionId: answer.questionId, correct: false, message: 'Question not found' };
          }

          const isCorrect = validateAnswer(question, answer.answer);
          return { questionId: answer.questionId, correct: isCorrect };
      });

      // Save results (if necessary)
      // For example, save to a results collection or update user progress

      res.status(200).json({ message: 'Test submitted successfully', results });
  } catch (error) {
      console.error('Error submitting test:', error);
      res.status(500).json({ message: 'Server error', error });
  }
});

 








// POST route  
 router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
     const categories = await Category.find().limit(12).lean();  
    console.log('Categories fetched:', categories); // 

    const newCategoryIds = [];

     for (let cat of categories) {
      const newCategory = new Category({
        ...cat,
        _id: new mongoose.Types.ObjectId(), // Assign a new ID
        name: `${cat.name} - copy ${new mongoose.Types.ObjectId()}` // Ensure unique name
      });
      await newCategory.save();
      console.log('New category saved:', newCategory); // Log each new category
      newCategoryIds.push(newCategory._id);
    }

    // Create a new test with all new category IDs
    const test = new Test({ name, categories: newCategoryIds });
    await test.save();
    console.log('New test saved:', test); // Log the new test

    res.status(201).json(test);
  } catch (err) {
    console.error('Error occurred:', err); // Log the error
    res.status(500).json({ message: err.message });
  }
});


router.get('/total', async (req, res) => {
  try {
    const count = await Test.countDocuments(); // Directly get the count of documents
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch all Test documents
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find().populate("categories").sort({ _id: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


///get by id 

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const test = await Test.findById(id)
      .populate({
        path: 'categories',
        populate: {
          path: 'questions'
        }
      })
      .exec();

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
);

////
// POST route to add a question to a specific category in a specific test
router.post('/:testId/categories/:categoryId', async (req, res) => {
  const { testId, categoryId } = req.params;
  const { type, name } = req.body;

  // Validate required fields
  if (!type || !name) {
    return res.status(400).json({ message: 'Type and name are required fields' });
  }

  try {
    // Validate test and category existence
    const test = await Test.findById(testId).populate('categories');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Log the IDs for debugging
    console.log('Category ID:', categoryId);
    console.log('Test Category IDs:', test.categories);

    // Check if the category belongs to the test
    const isCategoryInTest = test.categories.some(cat => cat._id.equals(category._id));
    if (!isCategoryInTest) {
      return res.status(400).json({ message: 'Category does not belong to the specified test' });
    }

    // Create a new question
    const question = new Question({
      type,
      name,
      category: categoryId
    });

    await question.save();

    // Add the question to the category
    category.questions.push(question._id);
    await category.save();

    res.status(201).json(question);
  } catch (err) {
    console.error('Error occurred:', err); // Log the error
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
