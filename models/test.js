const mongoose = require('mongoose');
 const Schema = mongoose.Schema;

const TestSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }]
});

TestSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TestSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('Test', TestSchema);
