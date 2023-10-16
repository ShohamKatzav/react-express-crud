const mongoose = require('mongoose');
const { Schema } = mongoose;

const todoSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
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
    autoCreate: false
});

module.exports = mongoose.model('Todo', todoSchema);