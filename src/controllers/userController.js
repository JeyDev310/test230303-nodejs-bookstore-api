const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserService = require('../services/userService')(User);
const appConfig = require('../config/config');

const newUser = async (req, res) => {
	const result = await UserService.newUser();

	if (result.err) {
		return res.status(401).json(result);
	}

	return res.status(201).json(result);
};

const loginUser = async (req, res) => {
	const clientId = req.body.clientId;
	const secretKey = req.body.secretKey;

	if (!clientId || !secretKey) {
		return res.status(401).json({message: 'Missing credentials'});
	}

	const loginAttempt = await UserService.loginUser(clientId, secretKey);

	if (loginAttempt.err) {
		return res.status(401).json(loginAttempt);
	}

	const toTokenise = {
		clientId: loginAttempt.clientId,
		secretKey: loginAttempt.secretKey,
	};

	jwt.sign(toTokenise, appConfig.jwtKey, {expiresIn: '1h'}, (err, token) => {
		if (err) {
			return res.status(401).json({message: 'Unable to authorise user'});
		}

		return res.status(200).json({token: token});
	});
};

const jwtRequired = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		return res.status(401).json({message: 'JWT required'});
	}
};

module.exports = {
	newUser: newUser,
	loginUser: loginUser,
	jwtRequired: jwtRequired,
};
