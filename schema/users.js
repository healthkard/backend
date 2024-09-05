const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    healthId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    email: { type: String },
    number: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    dateJoined: { type: Date, default: Date.now },
    startDate: { type: Date },
    expireDate: { type: Date },
    agent: { type: String, default: 'self' },
    payments: [{
        healthId: { type: String, required: true, unique: true },
        amount: { type: String, required: true },
        transactionId: { type: String, required: true },
        issueDate: { type: Date, default: Date.now },
        paymentStatus: { type: Boolean, default: false }
    }],
    visited: [{
        healthId: { type: String, required: true, unique: true },
        hospitalId: { type: String, required: false },
        hospitalName: { type: String, required: false },
        lastVisit: { type: Date, default: Date.now },
        frequency: { type: Number, default: 0 },
    }]
});

const User = mongoose.model('User', userSchema);
module.exports = User;