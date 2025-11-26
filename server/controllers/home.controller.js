const Home = require('../models/home.model');

// Tạo home mới
exports.createHome = async (req, res) => {
  try {
    const { name, address, owner } = req.body;
    const home = new Home({ name, address, owner });
    await home.save();
    res.status(201).json(home);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy tất cả home
exports.getHomes = async (req, res) => {
  try {
    const homes = await Home.find()
      .populate('owner')
      .populate('rooms')
      .populate({
        path: 'members.user',
        model: 'User'
      })
      .populate({
        path: 'members.addedBy',
        model: 'User'
      });
    res.json(homes);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy home theo id
exports.getHomeById = async (req, res) => {
  try {
    const home = await Home.findById(req.params.id)
      .populate('owner')
      .populate('rooms')
      .populate({
        path: 'members.user',
        model: 'User'
      })
      .populate({
        path: 'members.addedBy',
        model: 'User'
      });
    if (!home) return res.status(404).json({ error: 'Không tìm thấy home' });
    res.json(home);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Cập nhật home
exports.updateHome = async (req, res) => {
  try {
    const home = await Home.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!home) return res.status(404).json({ error: 'Không tìm thấy home' });
    res.json(home);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Xóa home
exports.deleteHome = async (req, res) => {
  try {
    const home = await Home.findByIdAndDelete(req.params.id);
    if (!home) return res.status(404).json({ error: 'Không tìm thấy home' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy danh sách home của user hiện tại
exports.getHomesByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const homes = await Home.find({ owner: userId })
  .populate('owner')
  .populate({
    path: 'rooms',
    populate: { path: 'devices' }
  })
  .populate('nodes')
  .populate({
    path: 'members.user',
    model: 'User'
  })
  .populate({
    path: 'members.addedBy',
    model: 'User'
  });
    res.json(homes);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy home theo id và user hiện tại
exports.getHomeByCurrentUserAndId = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const home = await Home.findOne({ _id: req.params.id, owner: userId })
      .populate('owner')
      .populate('rooms')
      .populate('nodes')
      .populate({
        path: 'members.user',
        model: 'User'
      })
      .populate({
        path: 'members.addedBy',
        model: 'User'
      });
    if (!home) return res.status(404).json({ error: 'Không tìm thấy home hoặc không có quyền' });
    res.json(home);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Cập nhật home của user hiện tại
exports.updateHomeByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const home = await Home.findOneAndUpdate({ _id: req.params.id, owner: userId }, req.body, { new: true });
    if (!home) return res.status(404).json({ error: 'Không tìm thấy home hoặc không có quyền' });
    res.json(home);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Xóa home của user hiện tại
exports.deleteHomeByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const home = await Home.findOneAndDelete({ _id: req.params.id, owner: userId });
    if (!home) return res.status(404).json({ error: 'Không tìm thấy home hoặc không có quyền' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};
