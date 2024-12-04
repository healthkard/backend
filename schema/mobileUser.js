const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        // unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true,
        trim: true
    },
    coins: {
        type: Number,
        required: false,
        default: 20,
    },

}, {
    timestamps: true
});

const MobileUser = mongoose.model('MobileUser', userSchema);

module.exports = MobileUser;
