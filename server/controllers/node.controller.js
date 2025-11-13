const Node = require('../models/node.model');
const Room = require('../models/room.model');

exports.getAll = async (req, res) => {
  try {
    const nodes = await Node.find().populate('devices room');
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const node = await Node.findById(req.params.id).populate('devices room');
    if (!node) return res.status(404).json({ error: 'Không tìm thấy node' });
    if (req.query.pinsUsed !== undefined) {
      let result = {};
      if (Array.isArray(node.devices)) {
        node.devices.forEach(device => {
          if (device.pin !== undefined && device.pin !== null) {
            // Trạng thái: 1 nếu device.status=true, 0 nếu false
            result[device.pin] = device.status ? 1 : 0;
          }
        });
      }
      return res.json(result);
    }

    // Mặc định trả về node đầy đủ
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Thiết lập các chân chưa dùng mặc định
    const defaultPins = [19, 5, 16, 0, 15];
    const nodeData = { ...req.body, pinsAvailable: defaultPins };
    const node = new Node(nodeData);
    await node.save();
    // Nếu có trường room, thêm node vào danh sách nodes của phòng
    if (node.room) {
      await Room.findByIdAndUpdate(node.room, { $addToSet: { nodes: node._id } });
    }
    res.json(node);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const node = await Node.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!node) return res.status(404).json({ error: 'Không tìm thấy node' });
    res.json(node);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const node = await Node.findByIdAndDelete(req.params.id);
    if (!node) return res.status(404).json({ error: 'Không tìm thấy node' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
