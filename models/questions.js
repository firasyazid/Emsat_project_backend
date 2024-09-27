const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MultipleChoiceSchema = new Schema({
  options: [String],
  correctAnswers: [String]   
});

const SingleChoiceSchema = new Schema({
  options: [String],
  correctAnswer: String
});

const DragAndDropSchema = new Schema({
  draggableItems: [String],
  correctSequence: [String], 
  correctSequenceParts: [String],
  correctResponse: String
});


const TextQuestionSchema = new Schema({
  correctAnswer: String
});

const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['multipleChoice', 'dragAndDrop', 'text', 'singleChoice'],
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  multipleChoiceData: MultipleChoiceSchema,
  dragAndDropData: DragAndDropSchema,
  singleChoiceData: SingleChoiceSchema,
  textQuestionData: TextQuestionSchema,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  validation: { 
    type: Boolean,
    default: false
  }
});

QuestionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

QuestionSchema.set('toJSON', {
  virtuals: true,
});

exports.Question = mongoose.model('Question', QuestionSchema);
