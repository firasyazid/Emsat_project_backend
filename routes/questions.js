const { Question } = require("../models/questions");
const express = require("express");
const router = express.Router();
const Category = require("../models/categories");
const Test = require("../models/test");

//one choice 

router.post('/singleChoice', async (req, res) => {
  try {
    const { text, options, correctAnswer, category, name } = req.body;

    // Validate the input
    if (!text || !options || !correctAnswer || !category || !name) {
      return res.status(400).send('All fields are required');
    }

    // Create the single-choice question
    const newQuestion = new Question({
      type: 'singleChoice',
      text: text,
      singleChoiceData: {
        options: options,
        correctAnswer: correctAnswer
      },
      category: category,
      name: name
    });

    // Save the question to the database
    await newQuestion.save();

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).send('Server error');
  }
});


//put single 
router.put('/singleChoice/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctAnswer, category, name, validation } = req.body;

    console.log('Update request received with data:', { text, options, correctAnswer, category, name, validation });

    // Find the existing question by ID
    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).send('Question not found');
    }

    // Create an object with only the fields that are provided
    const updateFields = {};
    if (text !== undefined) updateFields.text = text;
    if (category !== undefined) updateFields.category = category;
    if (name !== undefined) updateFields.name = name;
    if (validation !== undefined) updateFields.validation = validation;

    // Update singleChoiceData only if options or correctAnswer are provided
    if (options !== undefined || correctAnswer !== undefined) {
      updateFields['singleChoiceData.options'] = options !== undefined ? options : existingQuestion.singleChoiceData.options;
      updateFields['singleChoiceData.correctAnswer'] = correctAnswer !== undefined ? correctAnswer : existingQuestion.singleChoiceData.correctAnswer;
    }

    console.log('Update fields:', updateFields);

    // Update the question with new values
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).send('Question not found');
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).send('Server error');
  }
});

 
router.put('/multipleChoice/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctAnswers, category, name, validation } = req.body;

    console.log('Update request received with data:', { text, options, correctAnswers, category, name, validation });

    // Find the existing question by ID
    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).send('Question not found');
    }

    // Create an object with only the fields that are provided
    const updateFields = {};
    if (text !== undefined) updateFields.text = text;
    if (category !== undefined) updateFields.category = category;
    if (name !== undefined) updateFields.name = name;
    if (validation !== undefined) updateFields.validation = validation;

    // Update multipleChoiceData only if options or correctAnswers are provided
    if (options !== undefined || correctAnswers !== undefined) {
      updateFields['multipleChoiceData.options'] = options !== undefined ? options : existingQuestion.multipleChoiceData.options;
      updateFields['multipleChoiceData.correctAnswers'] = correctAnswers !== undefined ? correctAnswers : existingQuestion.multipleChoiceData.correctAnswers;
    }

    console.log('Update fields:', updateFields);

    // Update the question with new values
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).send('Question not found');
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).send('Server error');
  }
});


////put drag and drop 
 
  router.put('/dragAndDrop/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, dragAndDropData, category, name, validation } = req.body;

    console.log('Update request received with data:', { text, dragAndDropData, category, name, validation });

    // Find the existing question by ID
    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).send('Question not found');
    }

    // Create an object with only the fields that are provided
    const updateFields = {};
    if (text !== undefined) updateFields.text = text;
    if (category !== undefined) updateFields.category = category;
    if (name !== undefined) updateFields.name = name;
    if (validation !== undefined) updateFields.validation = validation;

    // Update dragAndDropData only if provided
    if (dragAndDropData !== undefined) {
      updateFields['dragAndDropData.draggableItems'] = dragAndDropData.draggableItems !== undefined ? dragAndDropData.draggableItems : existingQuestion.dragAndDropData.draggableItems;
      updateFields['dragAndDropData.correctSequence'] = dragAndDropData.correctSequence !== undefined ? dragAndDropData.correctSequence : existingQuestion.dragAndDropData.correctSequence;
      updateFields['dragAndDropData.correctSequenceParts'] = dragAndDropData.correctSequenceParts !== undefined ? dragAndDropData.correctSequenceParts : existingQuestion.dragAndDropData.correctSequenceParts;

      updateFields['dragAndDropData.correctResponse'] = dragAndDropData.correctResponse !== undefined ? dragAndDropData.correctResponse : existingQuestion.dragAndDropData.correctResponse;
    }

    console.log('Update fields:', updateFields);

    // Update the question with new values
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).send('Question not found');
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).send('Server error');
  }
});
   



 
 
router.get('/total', async (req, res) => {
  try {
    const count = await Question.countDocuments();
    res.json({ totalQuestions: count });
  } catch (err) {
    console.error('Error fetching total questions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the question by ID
    const question = await Question.findById(id).populate('category');

    if (!question) {
      return res.status(404).send('Question not found');
    }

    res.status(200).json(question);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

router.delete('/all', async (req, res) => {
  try {
    const result = await Question.deleteMany({});
    res.status(200).json({ message: 'All Question deleted successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Question', error });
  }
});


router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//multiple choice
router.post("/multiple-choice", async (req, res) => {
  const { text, options, correctAnswer, categoryId } = req.body;

  if (!text || !options || !correctAnswer || !categoryId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const newQuestion = new Question({
      type: "multipleChoice",
      text,
      multipleChoiceData: {
        options,
        correctAnswer,
      },
      category: category._id,
    });

    const savedQuestion = await newQuestion.save();

    const populatedQuestion = await Question.findById(
      savedQuestion._id
    ).populate("category", "name");

    res.status(201).json(populatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

///// drag & drop

router.post("/drag-and-drop", async (req, res) => {
  const { text, draggableItems, correctSequence,categoryId } = req.body;
  const newQuestion = new Question({
    type: "dragAndDrop",
    text,
    dragAndDropData: {
      draggableItems,
      correctSequence,
    },
    category: categoryId,
  });
  try {
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

///assign question to category

router.post("/", async (req, res) => {
  const {
    type,
    text,
    category: categoryId,
    multipleChoiceData,
    dragAndDropData,
    name,
  } = req.body;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

     const question = new Question({
      type,
      text,
      category: categoryId,
      multipleChoiceData,
      dragAndDropData,
      name
    });

     await question.save();

     category.questions.push(question._id);
    await category.save();

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//////
router.post('/question1', async (req, res) => {
  try {
    const { type, text, correctAnswer, category, name, testId } = req.body;

    if (type !== 'text') {
      return res.status(400).json({ error: 'Invalid question type' });
    }

    const test = await Test.findById(testId).populate('categories').exec();
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const categoryExists = test.categories.some(cat => cat._id.toString() === category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not part of the specified test' });
    }

    // Create and save the new question
    const newQuestion = new Question({
      type,
      text,
      textQuestionData: { correctAnswer },
      category,
      name
    });

    await newQuestion.save();

    // Update the category to include the new question
    await Category.findByIdAndUpdate(
      category,
      { $push: { questions: newQuestion._id } }
    );

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error occurred while saving the question:', error);
    res.status(500).json({ error: 'An error occurred while saving the question' });
  }
});


router.get('/cat/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
     const category = await Category.findById(categoryId).populate('questions').exec();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

     res.json(category.questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//add
router.delete("/:id", async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get correct answer indices for a multiple-choice question by ID
router.get('/correct-answer-indices/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await Question.findById(questionId).exec();

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.type !== 'multipleChoice') {
      return res.status(400).json({ error: 'This is not a multiple-choice question' });
    }

    const correctAnswerChoices = question.multipleChoiceData.correctAnswers.map(
      answer => {
        const index = question.multipleChoiceData.options.indexOf(answer);
        return `Choice ${index + 1}`;
      }
    );

    res.json({
      correctAnswerChoices
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'An error occurred while fetching the question' });
  }
});



router.get('/category/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    // Find the category by ID and populate the questions
    const category = await Category.findById(categoryId).populate('questions');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Send the questions back to the client
    res.json(category.questions);
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
