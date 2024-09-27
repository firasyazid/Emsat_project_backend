const mongoose = require('mongoose');
const { validate } = require('./categories');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  createdAt: {
    type: Date,
    default: function() {
      const currentDate = new Date();
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    },

    validation : {
      type:Boolean, 
      default: false
    }
  }
});

TestSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TestSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('Test', TestSchema);
