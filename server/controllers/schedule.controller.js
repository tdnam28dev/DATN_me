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
    const data = await Schedule.create(req.body);
    const schedule = await Schedule.findById(data._id)
      .populate('owner')
      .populate('device')
      .populate('room')
      .populate('node')
      .populate('createdBy');
    const io = req.app.get('io');
    io.to(`room_${schedule.node._id}`).emit('sendUpdateToNode', {
      action: 'createSchedule',
      id: schedule._id,
      isActive: schedule.isActive,
      led: schedule.device.pin,
      onTime: schedule.onTime,
      offTime: schedule.offTime,
      repeat: schedule.repeat,
    });
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

// Lấy danh sách lịch của user hiện tại
exports.getSchedulesByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });

    // Tìm tất cả home mà user là owner hoặc là thành viên
    const Home = require('../models/home.model');
    const homes = await Home.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    // Lấy danh sách userId của chủ nhà và các thành viên
    let memberIds = [];
    homes.forEach(home => {
      memberIds.push(home.owner.toString());
      home.members.forEach(m => {
        if (m.user) memberIds.push(m.user.toString());
      });
    });
    memberIds = [...new Set(memberIds)];

    // Xây dựng điều kiện lọc
    let filter = {
      $or: [
        { owner: { $in: memberIds } },
        { createdBy: { $in: memberIds } }
      ]
    };
    // Nếu có query device thì lọc thêm theo device
    if (req.query && req.query.device) {
      filter.device = req.query.device;
    }

    // Lấy tất cả lịch phù hợp
    const schedules = await Schedule.find(filter)
      .populate('owner')
      .populate('device')
      .populate('room')
      .populate('node')
      .populate('createdBy');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Lấy schedule theo id và user hiện tại
exports.getScheduleByCurrentUserAndId = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });

    // Tìm schedule theo id và quyền truy cập
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      $or: [
        { owner: userId },
        { createdBy: userId }
      ]
    })
      .populate('owner')
      .populate('device')
      .populate('room')
      .populate('node')
      .populate('createdBy');
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy schedule hoặc không có quyền' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Cập nhật schedule của user hiện tại
exports.updateScheduleByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const schedule = await Schedule.findOneAndUpdate({
      _id: req.params.id,
      $or: [
        { owner: userId },
        { createdBy: userId }
      ]
    }, req.body, { new: true })
      .populate('owner')
      .populate('device')
      .populate('room')
      .populate('node')
      .populate('createdBy');
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy schedule hoặc không có quyền' });
    const io = req.app.get('io');
    io.to(`room_${schedule.node._id}`).emit('sendUpdateToNode', {
      action: 'updateSchedule',
      id: schedule._id,
      isActive: schedule.isActive,
      onTime: schedule.onTime,
      offTime: schedule.offTime,
      repeat: schedule.repeat,
    });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};

// Xóa schedule của user hiện tại
exports.deleteScheduleByCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) return res.status(401).json({ error: 'Lỗi xác thực' });
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { owner: userId },
        { createdBy: userId }
      ]
    });
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy schedule hoặc không có quyền' });
    const io = req.app.get('io');
    io.to(`room_${schedule.node._id}`).emit('sendUpdateToNode', {
      action: 'deleteSchedule',
      id: schedule._id,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Máy chủ lỗi: ' + err.message });
  }
};
