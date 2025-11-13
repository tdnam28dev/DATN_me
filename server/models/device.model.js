const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // ví dụ: 'light', 'fan', 'sensor', 'door', 'camera'
    status: { type: Boolean, default: false },
    location: { type: String },
    pin: { type: Number }, // chân GPIO, chỉ dùng cho bóng đèn
    doorPassword: { type: String }, // chỉ dùng cho thiết bị cửa
    node: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }, // liên kết với ESP/node
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    lastActive: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
