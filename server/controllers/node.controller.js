const Node = require('../models/node.model');
const Home = require('../models/home.model');

exports.getAll = async (req, res) => {
  try {
    const nodes = await Node.find().populate('devices home');
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const node = await Node.findById(req.params.id).populate('devices home');
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
    // Nếu có trường home, thêm node vào danh sách nodes của phòng
    if (node.home) {
      await Home.findByIdAndUpdate(node.home, { $addToSet: { nodes: node._id } });
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

// Lấy danh sách nodes của user hiện tại, cho phép lọc theo query động
exports.getNodesByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const filter = { owner: userId };
    Object.keys(req.query).forEach(key => {
      filter[key] = req.query[key];
    });
    const nodes = await Node.find(filter)
      .populate('owner')
      .populate('home')
      .populate('devices');
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy home theo id và user hiện tại
exports.getNodeByCurrentUserAndId = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const node = await Node.findOne({ _id: req.params.id, owner: userId })
      .populate('owner')
      .populate('home')
      .populate('devices');
    if (!node) return res.status(404).json({ error: 'Không tìm thấy node hoặc không có quyền' });
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Cập nhật node của user hiện tại
exports.updateNodeByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const node = await Node.findOneAndUpdate({ _id: req.params.id, owner: userId }, req.body, { new: true });
    if (!node) return res.status(404).json({ error: 'Không tìm thấy node hoặc không có quyền' });
    res.json(node);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Xóa node của user hiện tại
exports.deleteNodeByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const node = await Node.findOneAndDelete({ _id: req.params.id, owner: userId });
    if (!node) return res.status(404).json({ error: 'Không tìm thấy node hoặc không có quyền' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};
