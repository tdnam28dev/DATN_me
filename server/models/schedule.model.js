const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // chủ sở hữu lịch
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // phòng liên quan
    node: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }, // node liên quan
    action: { type: String },
    value: { type: String },
    time: { type: Date },
    onTime: { type: String }, // thời gian bật
    offTime: { type: String },   // thời gian tắt
    repeat: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'], default: 'once' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
