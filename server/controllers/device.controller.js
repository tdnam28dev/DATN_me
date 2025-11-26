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
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const { name, type, room, node, pin } = req.body;
    const deviceData = { name, type, room, node, pin, owner: userId };
    const device = await Device.create(deviceData);
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
        if (device.pin) {
          if (!node.pinsUsed.includes(device.pin)) {
            node.pinsUsed.push(device.pin);
          }
          node.pinsAvailable = node.pinsAvailable.filter(pin => pin !== device.pin);
        }
        await node.save();
      }
    }
    const io = req.app.get('io');
    // Gửi lệnh tới node qua socket.io
    io.to(`room_${device.node._id}`).emit('sendUpdateToNode', {
      action: 'createPin',
      id: device._id,
      led: device.pin,
      value: device.status ? 1 : 0
    });
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

// Lấy danh sách Devices của user hiện tại
exports.getDevicesByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    // Tạo filter từ query
    const filter = { owner: userId };
    // Lọc theo các trường query (room, type, status, ...)
    if (req.query.room) filter.room = req.query.room;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.node) filter.node = req.query.node;
    // Có thể mở rộng thêm các trường khác nếu cần
    const devices = await Device.find(filter)
      .populate('owner')
      .populate('room')
      .populate('node');
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy device theo id và user hiện tại
exports.getDeviceByCurrentUserAndId = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const device = await Device.findOne({ _id: req.params.id, owner: userId })
      .populate('owner')
      .populate('room')
      .populate('node');
    if (!device) return res.status(404).json({ error: 'Không tìm thấy device hoặc không có quyền' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Cập nhật device của user hiện tại
exports.updateDeviceByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const device = await Device.findOneAndUpdate({ _id: req.params.id, owner: userId }, req.body, { new: true })
      .populate('owner')
      .populate('room')
      .populate('node');
    if (!device) return res.status(404).json({ error: 'Không tìm thấy device hoặc không có quyền' });
    // Lấy io từ app
    const io = req.app.get('io');
    // Gửi lệnh tới node qua socket.io
    io.to(`room_${device.node._id}`).emit('sendUpdateToNode', {
      action: 'updateStatus',
      led: device.pin,
      value: device.status ? 1 : 0
    });
    io.to(`room_${device.node._id}`).emit('sendUpdateToApp', device);
    res.json(device);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Xóa device của user hiện tại
exports.deleteDeviceByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const device = await Device.findOneAndDelete({ _id: req.params.id, owner: userId });
    if (!device) return res.status(404).json({ error: 'Không tìm thấy device hoặc không có quyền' });
    if (device.room) {
      await Room.findByIdAndUpdate(device.room, { $pull: { devices: device._id } });
    }
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
    if (device.type === 'light' && device.node) {
      const io = req.app.get('io');
      // Gửi lệnh tới node qua socket.io
      io.to(`room_${device.node._id}`).emit('sendUpdateToNode', {
        action: 'deletePin',
        led: device.pin,
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};
