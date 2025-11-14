const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
