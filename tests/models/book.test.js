const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Book = require('../../src/models/book');

describe('Book Model', () => {
	beforeAll(async () => {
		server = await MongoMemoryServer.create();
		process.env.DB_URI = server.getUri();

		try {
			await mongoose.connect(process.env.DB_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
		} catch (e) {
			console.log(e);
		}
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await server.stop();
	});

	test('Module should be defined', async () => {
		expect(Book).toBeDefined();
	});
});
