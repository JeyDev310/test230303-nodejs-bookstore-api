const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const BookSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	year: {
		type: String,
		required: true,
	},
	cover: {
		type: String,
	},
});

module.exports = mongoose.model('Book', BookSchema);
