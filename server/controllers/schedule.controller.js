const Schedule = require('../models/schedule.model');

exports.getAll = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('device createdBy');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('device createdBy');
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy lịch' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy lịch' });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy lịch' });
    res.json({ message: 'Đã xóa lịch' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
