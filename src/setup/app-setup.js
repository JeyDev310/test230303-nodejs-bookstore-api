const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const appConfig = require('../config/config');


module.exports = (app) => {
	app.use(bodyParser.urlencoded({extended: true}));

	app.use(bodyParser.json());

	if (appConfig.env != 'test') {
		app.use(morgan('short'));
	}

	app.use((req, res, next) => {
		if (req.headers.authorization &&
			req.headers.authorization.split(' ')[0] == 'JWT') {
			const authToken = req.headers.authorization.split(' ')[1];

			jwt.verify(authToken, appConfig.jwtKey, (err, decoded) => {
				req.user = (err)? null : decoded;
				return next();
			});
		} else {
			req.user = null;
			return next();
		}
	});

	// Implement rate limiting to prevent brute force attacks
	const limiter = rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 5, // limit each IP to 5 requests per windowMs
		message: 'Too many requests, please try again later'
	});
	app.use('/user/login', limiter);	
};
