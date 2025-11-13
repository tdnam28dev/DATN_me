const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { username, email, password, name, phone } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ error: 'Username hoặc email đã tồn tại' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, name, phone });
    res.status(201).json({ message: 'Đăng ký thành công', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    if (!user.isActive) return res.status(403).json({ error: 'Tài khoản đã bị khóa hoặc vô hiệu hóa' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Sai mật khẩu' });

    // Trả về thông tin cơ bản
    const token = jwt.sign({
      id: user._id,
      username: user.username,
      name: user.name
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      id: user._id,
      username: user.username,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy danh sách tất cả user
exports.getAll = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo user mới
exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy user theo id
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Lỗi xác thực' });
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Cập nhật user hiện tại từ token
exports.updateCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Lỗi xác thực' });
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(decoded.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Cập nhật user
exports.update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa user
exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json({ message: 'Đã xóa user' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
