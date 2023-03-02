const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const BookSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
		maxlength: 255, // maximum length of 255 characters
	},
	description: {
		type: String,
		required: true,
		maxlength: 2000, // maximum length of 2000 characters
	},
	author: {
		type: String,
		required: true,
		maxlength: 255, // maximum length of 255 characters
	},
	year: {
		type: Number,
		required: true,
		validate: {
			validator: function(value) {
				const currentYear = new Date().getFullYear();
				return Number.isInteger(value) && value >= 1 && value <= currentYear;
			},
			message: 'Year must be a positive integer between 0 and the current year'
		}		
	},
	cover: {
		type: String,
		maxlength: 1000, // maximum length of 1000 characters
	},
});

module.exports = mongoose.model('Book', BookSchema);
