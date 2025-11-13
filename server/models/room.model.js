const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
    nodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Node' }], // các ESP/node trong phòng
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
