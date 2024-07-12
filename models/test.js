const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
});

TestSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TestSchema.set('toJSON', {
  virtuals: true,
});
 

exports.Test = mongoose.model('Test', TestSchema);
exports.TestSchema = TestSchema;