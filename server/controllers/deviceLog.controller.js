const DeviceLog = require('../models/deviceLog.model');

exports.getAll = async (req, res) => {
  try {
    const logs = await DeviceLog.find().populate('device');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const log = await DeviceLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const log = await DeviceLog.findById(req.params.id).populate('device');
    if (!log) return res.status(404).json({ error: 'Không tìm thấy log' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const log = await DeviceLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: 'Không tìm thấy log' });
    res.json({ message: 'Đã xóa log' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
