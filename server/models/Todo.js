const mongoose = require('mongoose');
const { Schema } = mongoose;

const todoSchema = new Schema({
    todo: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    }
}, {
    capped: { size: 1024 },
    bufferCommands: false,
    autoCreate: false
});

module.exports = mongoose.model('Todo', todoSchema);