const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// eslint-disable-next-line new-cap
const UserSchema = mongoose.Schema({
	clientId: {
		type: String,
		required: true,
		unique: true,
	},
	secretKey: {
		type: String,
		required: true,
	},
	created_at: {
		type: String,
		default: new Date(),
	},
});

UserSchema.methods.compareSecretKey = async (secretKey, hashedSecretKey) => {
	try {
		return await bcrypt.compare(secretKey, hashedSecretKey);
	} catch (err) {
		console.err(err.message);
		// If an error occured in the comparing we treat it as false secretKey
		return false;
	}
};

module.exports = mongoose.model('User', UserSchema);
