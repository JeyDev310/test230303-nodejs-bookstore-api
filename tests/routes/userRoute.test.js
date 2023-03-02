const path = require('path');

// load up the .env variables for testing express server before importing them
process.env.DB_URI = null;
process.env.JWT_KEY = 'Keyboardkitty';
process.env.PORT = null;
process.env.NODE_ENV = 'test';

// To make the current context happy running the config code
process.argv.push(path.join(__dirname, '.test.env'));

const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const request = require('supertest');
const userRoute = require('../../src/routes/userRouter');
const appSetup = require('../../src/setup/app-setup');

// Setting up express server for testing
const app = express();

// Mongoose Server instance
let server;
let newUser = {};

describe('Accessing Endpoint: /user', () => {
	beforeAll(async () => {
		server = await MongoMemoryServer.create();
		process.env.DB_URI = server.getUri();

		// eslint-disable-next-line max-len
		try {
			await mongoose.connect(process.env.DB_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
		} catch (e) {
			console.log(e);
		}

		appSetup(app);
		app.use('/user', userRoute);
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await server.stop();
	});

	describe('User Creation', () => {
		test('Server should return created new user', (done) => {
			request(app)
				.post('/user/new')
				.send({})
				.expect(201)
				.then((res) => {
					const { clientId, secretKey } = res.body;
					newUser = { clientId, secretKey };
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});	

	describe('User Login', () => {
		test('Given a valid clientId and secretKey, user must be logged in',
			(done) => {
				request(app)
					.post('/user/login')
					.send({
						clientId: newUser.clientId,
						secretKey: newUser.secretKey,
					})
					.expect('Content-Type', /json/)
					.expect(200)
					.then((res) => {
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

		test('Given a valid clientId but no secretKey, login should be rejected',
			(done) => {
				request(app)
					.post('/user/login')
					.send({
						clientId: newUser.clientId,
					})
					.expect('Content-Type', /json/)
					.expect(401)
					.then((res) => {
						expect(res.body.message).toMatch('Missing credentials');
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

		test('Given a valid clientId but wrong secretKey, login should be rejected',
			(done) => {
				request(app)
					.post('/user/login')
					.send({
						clientId: newUser.clientId,
						secretKey: 'wrongpassword',
					})
					.expect('Content-Type', /json/)
					.expect(401)
					.then((res) => {
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

		test('Given an invalid clientId, login should be rejected', (done) => {
			request(app)
				.post('/user/login')
				.send({
					clientId: 'noClientId',
					secretKey: newUser.secretKey,
				})
				.expect('Content-Type', /json/)
				.expect(401)
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});
});
