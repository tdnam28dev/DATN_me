const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    action: { type: String, required: true }, // ví dụ: 'turn_on', 'turn_off'
    value: { type: String }, // giá trị đặt nếu có
    time: { type: Date, required: true },
    repeat: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
