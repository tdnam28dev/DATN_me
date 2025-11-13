const Room = require('../models/room.model');

exports.getAll = async (req, res) => {
  try {
    const rooms = await Room.find().populate('devices');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const Home = require('../models/home.model');

exports.create = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    // Nếu có homeId trong req.body thì thêm room vào home
    if (req.body.home) {
      await Home.findByIdAndUpdate(
        req.body.home,
        { $push: { rooms: room._id } },
        { new: true }
      );
    }
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('devices');
    if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });
    res.json({ message: 'Đã xóa phòng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
