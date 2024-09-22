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
    healthkardsTarget: {
        type: Number,
        default: 15000
    },
    hospitalsTarget: {
        type: Number,
        default: 10
    },
    usersAdded: [{
        healthID: String,
        name: String,
        amount: {
            type: Number,
            default: 99
        },
        type: {
            type: String,
            enum: ['new', 'renew'],
            default: 'renew',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        plan: {
            type: String,
            enum: ['1 month', '3 months', '6 months', '1 year'],
            default: '1 month'
        }
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