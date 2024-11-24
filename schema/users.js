const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    healthId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: false },
    email: { type: String },
    number: { type: String, required: true },
    dob: { type: Date, required: true, default: Date.now },
    gender: { type: String, required: true, default: 'male' },
    age: { type: String, required: false },
    address: { type: String, required: false },
    city: { type: String, required: false },
    pincode: { type: String, required: false },
    dateJoined: { type: Date, default: Date.now },
    startDate: { type: Date },
    expireDate: { type: Date, default: Date.now },
    agent: { type: String, default: 'self' },
    payments: [{
        amount: { type: Number, required: true, default: 99 },
        plan: { type: String, required: true, default: '1 month' },
        transactionId: { type: String, default: null },
        issueDate: { type: Date, default: Date.now },
        paymentStatus: { type: Boolean, default: false },
        agent: { type: String, default: 'self' }
    }],
    visited: [{
        hospitalId: { type: String, required: false },
        hospitalName: { type: String, required: false },
        lastVisit: { type: Date, default: Date.now },
        frequency: { type: Number, default: 0 },
    }],
    records: [{ type: String, default: null }],
    registered: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
module.exports = User;