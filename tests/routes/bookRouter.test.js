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
const User = require('../../src/models/user');
const Book = require('../../src/models/book');
const bookRouter = require('../../src/routes/bookRouter');
const appSetup = require('../../src/setup/app-setup');
const userData = require('../data/user-data');
const bookData = require('../data/book-data');

// Instead of using the /user/login route, we are gonna get a JWT in setup
const jwt = require('jsonwebtoken');
let validJwt = null;

// Setting up express server for testing
const app = express();

// Mongoose Server instance
let server;

// book to update and delete
let bookToModify;

describe('Accessing Endpoint: /api/books', () => {
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
		app.use('/api/books', bookRouter);

		// Add a dummy user to work with
		await new User(userData[0]).save();

		for (let i = 0; i < bookData.length; i++) {
			await new Book(bookData[i]).save();
		}

		jwt.sign({clientId: '12345', secretKey: 'This is some password'},
			process.env.JWT_KEY, {expiresIn: '1h'}, (err, token) => {
				validJwt = token;
			});
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await server.stop();
	});

	// eslint-disable-next-line max-len
	describe('Given that no JWT is passed in as authorization to access API', () => {
		test('Should reject request to get all books', (done) => {
			request(app)
				.get('/api/books')
				.expect('Content-Type', /json/)
				.expect(401)
				.then((res) => {
					expect(res.body).toEqual({message: 'JWT required'});
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Should reject request to get a single book', (done) => {
			request(app)
				.get('/api/books/somevalidid')
				.expect('Content-Type', /json/)
				.expect(401)
				.then((res) => {
					expect(res.body).toEqual({message: 'JWT required'});
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Should reject request to add a new book', (done) => {
			request(app)
				.post('/api/books')
				.expect('Content-Type', /json/)
				.expect(401)
				.then((res) => {
					expect(res.body).toEqual({message: 'JWT required'});
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Should reject request to update a books detail', (done) => {
			request(app)
				.put('/api/books/somevalidid')
				.expect('Content-Type', /json/)
				.expect(401)
				.then((res) => {
					expect(res.body).toEqual({message: 'JWT required'});
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Should reject attempt to delete a book', (done) => {
			request(app)
				.delete('/api/books/somevalidid')
				.expect('Content-Type', /json/)
				.expect(401)
				.then((res) => {
					expect(res.body).toEqual({message: 'JWT required'});
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});

	// eslint-disable-next-line max-len
	describe('Given that a valid JWT token is passed in as authorization to access API', () => {
		test('Can get all books from database', (done) => {
			request(app)
				.get('/api/books')
				.set('authorization', `JWT ${validJwt}`)
				.expect('Content-Type', /json/)
				.expect(200)
				.then((res) => {
					expect(res.body.length).toBe(3);
					bookToModify = res.body[0];
					done();
				})
				.catch((err) => {
					console.log(err);
					done(err);
				});
		});

		test('Can get a single book from the database', (done) => {
			request(app)
				.get(`/api/books/${bookToModify._id}`)
				.set('authorization', `JWT ${validJwt}`)
				.expect('Content-Type', /json/)
				.expect(200)
				.then((res) => {
					expect(res.body.length).toBe(1);
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Can add a single book to the database', (done) => {
			request(app)
				.post('/api/books')
				.set('authorization', `JWT ${validJwt}`)
				.send({
					title: 'Test Book',
					description: 'Description 1',
					author: 'Test Author',
					year: 1940,
					cover: 'cover',
				})
				.expect('Content-Type', /json/)
				.expect(201)
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Can update a books detail in database', (done) => {
			// eslint-disable-next-line max-len
			request(app)
				.put(`/api/books/${bookToModify._id}`)
				.set('authorization', `JWT ${validJwt}`)
				.send({
					title: 'Updated Book',
					author: 'Updated Author 22',
					year: 1936,
					description: 'Updated Description22',
					cover: 'Updated cover',
				})
				.expect('Content-Type', /json/)
				.expect(201)
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Can delete a book', (done) => {
			request(app)
				.delete(`/api/books/${bookToModify._id}`)
				.set('authorization', `JWT ${validJwt}`)
				.expect(204)
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});

	// eslint-disable-next-line max-len
	describe('Given that a valid JWT token is passed in as authorization with an invalid book ID', () => {
		test('Should reject attempt to get a single book', (done) => {
			request(app)
				.put(`/api/books/invalid_id`)
				.set('authorization', `JWT ${validJwt}`)
				.expect('Content-Type', /json/)
				.expect(400)
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Should reject attempt to update a books details', (done) => {
			request(app)
				.put(`/api/books/invalid_id`)
				.send({
					title: 'Updated Book',
					author: 'Updated Author 22',
					year: 1936,
					description: 'Updated Description22',
					cover: 'Updated cover',
				})
				.set('authorization', `JWT ${validJwt}`)
				.expect(400)
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		test('Should reject attempt to delete a book and its details', (done) => {
			request(app)
				.put(`/api/books/invalid_id`)
				.set('authorization', `JWT ${validJwt}`)
				.expect(400)
				.then((res) => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});
});
