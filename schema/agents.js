const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
    agentID: {
        type: String,
        unique: true
    },
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    number: String,
    createDate: String,
    usersAdded: [{
        healthID: String,
        name: String,
        amount: Number,
        type: {
            type: String,
            enum: ['new', 'renew'],
            default: 'renewal',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        plan: String
    }],
    hospitalsAdded: [{
        hospitalID: String,
        name: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
});

const Agent = mongoose.model('Agent', AgentSchema);

module.exports = Agent;