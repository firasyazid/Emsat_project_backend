const mongoose = require('mongoose');
const Schema = mongoose.Schema;

 const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

 const MultipleChoiceSchema = new Schema({
  options: [String],
  correctAnswer: String
});

 const DragAndDropSchema = new Schema({
  draggableItems: [String],
  correctSequence: [String]
});

 const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['multipleChoice', 'dragAndDrop'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  multipleChoiceData: MultipleChoiceSchema,
  dragAndDropData: DragAndDropSchema,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
});

 QuestionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

 QuestionSchema.set('toJSON', {
  virtuals: true,
});

exports.Question = mongoose.model('Question', QuestionSchema);
exports.Category = mongoose.model('Category', CategorySchema);
