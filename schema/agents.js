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
        date: {
            type: Date,
            default: Date.now
        }
    }],
    hospitalsAdded: [{
        hospitalId: String,
        name: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    totalCount: {
        type: Number,
        default: 0
    },
    todaysCount: {
        type: Number,
        default: 0
    }
});

const AgentModel = mongoose.model('Agent', AgentSchema);

module.exports = AgentModel;