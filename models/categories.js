const mongoose = require('mongoose');
const Schema = mongoose.Schema;

 const CategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }],
  timeLimit: {
    type: Number,
    required: true
  }
});

 CategorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

CategorySchema.set('toJSON', {
  virtuals: true,
});

 module.exports = mongoose.model('Category', CategorySchema);
