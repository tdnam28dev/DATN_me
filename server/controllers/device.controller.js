const Device = require('../models/device.model');
const Room = require('../models/room.model');
const Node = require('../models/node.model');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    // Nếu có query param room, lọc theo phòng
    if (req.query.room) {
      filter.room = req.query.room;
    }
    const devices = await Device.find(filter);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const device = await Device.create(req.body);
    // Nếu có trường room, thêm thiết bị vào danh sách devices của phòng
    if (device.room) {
      await Room.findByIdAndUpdate(device.room, { $addToSet: { devices: device._id } });
    }
    // Nếu có trường node, thêm thiết bị vào danh sách devices của node và cập nhật pinsUsed/pinsAvailable
    if (device.node) {
      const node = await Node.findById(device.node);
      if (node) {
        // Thêm device vào danh sách devices của node nếu chưa có
        if (!node.devices.map(d => String(d)).includes(String(device._id))) {
          node.devices.push(device._id);
        }
        // Nếu có pin, cập nhật pinsUsed và loại bỏ khỏi pinsAvailable
        if (device.pin !== undefined && device.pin !== null) {
          if (!node.pinsUsed.includes(device.pin)) {
            node.pinsUsed.push(device.pin);
          }
          node.pinsAvailable = node.pinsAvailable.filter(pin => pin !== device.pin);
        }
        await node.save();
      }
    }
    res.status(201).json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!device) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });

    // Nếu là thiết bị bóng đèn, có trường pin và node, gửi thông báo tới node
    if (device.type === 'light' && device.pin && device.node) {
      // Lấy io từ app
      const io = req.app.get('io');
      // Gửi lệnh tới node qua socket.io
      io.to(`room_${device.node}`).emit('serverMessage', {
        action: 'toggle',
        led: device.pin,
        value: device.status ? 1 : 0
      });
    }

    res.json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });

    // Nếu device có trường node, xóa device khỏi danh sách devices của node và cập nhật lại pins
    if (device.node) {
      const node = await Node.findById(device.node);
      if (node) {
        // Xóa device khỏi danh sách devices của node
        node.devices = node.devices.filter(did => String(did) !== String(device._id));
        // Nếu device có pin, cập nhật lại pinsUsed và pinsAvailable
        if (device.pin) {
          // Xóa pin khỏi pinsUsed
          node.pinsUsed = node.pinsUsed.filter(pin => pin !== device.pin);
          // Thêm pin vào pinsAvailable nếu chưa có
          if (!node.pinsAvailable.includes(device.pin)) {
            node.pinsAvailable.push(device.pin);
          }
        }
        await node.save();
      }
    }

    res.json({ message: 'Đã xóa thiết bị' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
