const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, unique: true },
	name: { type: String, required: true },
	password: { type: String, required: true },
	phone: { type: String },
	country: { type: String },
	isActive: { type: Boolean, default: true },
}, {
	timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
