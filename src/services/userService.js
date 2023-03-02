const ShortUniqueId = require('short-unique-id');
var GeneratePassword = require('generate-password');

const newUser = (Model, bcrypt) => async () => {
	const uid = new ShortUniqueId({dictionary: 'number', length: 10});

	const clientId = uid();
	const secretKey = GeneratePassword.generate({
		length: 20,
		numbers: true,
		symbols: true,
	});
	let userToRegister = new Model({clientId: clientId, secretKey: secretKey});

	try {
		userToRegister.secretKey = await bcrypt.hash(userToRegister.secretKey, 10);
		userToRegister = await userToRegister.save();
	} catch (err) {
		console.error(err);
		if (err.message.includes('E11000')) {
			return {err: 'Duplicate clientId'};
		} else {
			return {err: err.message};
		}
	}

	userToRegister.secretKey = secretKey;

	return userToRegister;
};

const loginUser = (Model) => async (clientId, secretKey) => {
	let user = null;

	try {
		user = await Model.findOne({clientId: clientId});
	} catch (err) {
		console.error(err.message);
		return {err: err.message};
	}

	if (!user) {
		return {err: 'Unauthorised. No user found!'};
	}

	try {
		const result = await user.compareSecretKey(secretKey, user.secretKey);
		return (result) ? user : {err: 'Invalid secretKey'};
	} catch (err) {
		console.log(err.message);
		return {err: err.message};
	}
};

module.exports = (UserModel, bcrypt = require('bcrypt')) => {
	return {
		newUser: newUser(UserModel, bcrypt),
		loginUser: loginUser(UserModel),
	};
};
