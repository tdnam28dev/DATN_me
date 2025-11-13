require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Kết nối MongoDB thành công');
}).catch((err) => {
  console.error('Lỗi kết nối MongoDB:', err);
});


// Tích hợp socket.io cho các thiết bị
io.on('connection', (socket) => {
	socket.on('joinRoom', (roomId) => {
		socket.join(`room_${roomId}`);
		console.log(`Client đã vào phòng: room_${roomId}`);
		socket.emit('notification', {
			type: 'success',
			message: `Đã kết nối tới phòng: ${roomId}`,
			time: new Date(),
		});
	});

	socket.on('deviceMessage', (msg) => {
		console.log('Nhận deviceMessage từ ESP32:', msg);
		// Phản hồi lại client
		socket.emit('serverMessage', `Server đã nhận: ${msg}`);
	});

	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
});

// Cho phép truy cập io từ controller
app.set('io', io);

const userRoutes = require('./routes/user.route');
const scheduleRoutes = require('./routes/schedule.route');
const authRoutes = require('./routes/auth.route');
const deviceRoutes = require('./routes/device.route');
const roomRoutes = require('./routes/room.route');
const deviceLogRoutes = require('./routes/deviceLog.route');
const notificationRoutes = require('./routes/notification.route');
const nodeRoutes = require('./routes/node.route');
const homeRoutes = require('./routes/home.route');

// Import middleware auth
const auth = require('./middlewares/auth');


// Import các route API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', auth, userRoutes);
app.use('/api/v1/devices', auth, deviceRoutes);
app.use('/api/v1/rooms', auth, roomRoutes);
app.use('/api/v1/device-logs', auth, deviceLogRoutes);
app.use('/api/v1/notifications', auth, notificationRoutes);
app.use('/api/v1/schedules', auth, scheduleRoutes);
app.use('/api/v1/nodes', auth, nodeRoutes);
app.use('/api/v1/homes', auth, homeRoutes);



const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
	console.log(`Server đang chạy tại http://${HOST}:${PORT}`);
});

