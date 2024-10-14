const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    date: { type: Date, default: Date.now },
});


const Record = mongoose.model('Record', recordSchema);
module.exports = Record;