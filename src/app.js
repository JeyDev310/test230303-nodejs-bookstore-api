const express = require('express');
const mongoose = require('mongoose');
const appConfig = require('./config/config');
const appSetup = require('./setup/app-setup');
const bookRouter = require('./routes/bookRouter');
const userRouter = require('./routes/userRouter');

const app = express();

const DB_OPTIONS = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

async function appMain() {
	appSetup(app);

	app.use('/api/books', bookRouter);
	app.use('/user', userRouter);
	
	try {
		await mongoose.connect(process.env.DB_URI, DB_OPTIONS);
		console.log('Connected to mongoose server');
	
		app.listen(appConfig.port, () => {
			console.log('> Server started on PORT: ', appConfig.port);
		});		
	} catch (e) {
		console.error(err.message);
		process.exit(1);
	}
}

appMain();