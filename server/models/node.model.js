const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Tên ESP hoặc node
    ip: { type: String }, // Địa chỉ IP
    mac: { type: String }, // Địa chỉ MAC
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' }, // Nhà chứa node
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }], // Các thiết bị gắn với node
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'light' }, // Loại node: 'light', 'camera', 'door', ...
    lastActive: { type: Date, default: Date.now },
    pinsUsed: [{ type: Number }], // Các pin đang dùng
    pinsAvailable: [{ type: Number }], // Các pin chưa dùng
    isConfig: { type: Boolean, default: false }, // Đã cấu hình chưa
    status: { type: Boolean, default: false } // Trạng thái: 'online' hoặc 'offline'
}, {
    timestamps: true
});

module.exports = mongoose.model('Node', nodeSchema);
