const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        maxlength: 40,
    },
    nameLower: {
        type: String,
        required: true,
        maxlength: 40,
    },
}, {
    timestamps: true,
});

projectSchema.index({ user_id: 1, nameLower: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
