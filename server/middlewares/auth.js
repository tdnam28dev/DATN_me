// Middleware xác thực JWT cho user
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Không có token xác thực' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Đảm bảo luôn có trường _id cho user
    if (decoded._id) {
      req.user = { ...decoded, _id: decoded._id };
    } else if (decoded.id) {
      req.user = { ...decoded, _id: decoded.id };
    } else {
      req.user = decoded;
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
};
