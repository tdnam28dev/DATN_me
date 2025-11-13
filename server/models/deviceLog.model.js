const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    action: { type: String, required: true }, // ví dụ: 'turn_on', 'turn_off', 'update'
    value: { type: String }, // giá trị cảm biến hoặc trạng thái mới
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceLog', deviceLogSchema);
