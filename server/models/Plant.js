const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  species: String,
  location: String,
  notes: String,
  wateringEveryDays: { type: Number, default: 7, min: 1 },
  lastWatered: { type: Date, default: Date.now },
  nextWatering: Date,
}, { timestamps: true });

schema.pre('save', function (next) {
  this.nextWatering = new Date(this.lastWatered.getTime() + this.wateringEveryDays * 86400000);
  next();
});
module.exports = mongoose.model('Plant', schema);
