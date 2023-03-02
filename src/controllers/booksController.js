const Book = require('../models/book');
const BookService = require('../services/bookService')(Book);

const getBooks = async (req, res) => {
	const result = await BookService.getBooks();

	if (result.err) {
		res.status(500).set('Content-Type', 'application/json').json(result);
	}

	res.status(200).set('Content-Type', 'application/json').json(result);
};

const getBook = async (req, res) => {
	const result = await BookService.getBook(req.params.bookID);

	if (result.err) {
		res.status(500).set('Content-Type', 'application/json').json(result);
	}

	res.status(200).set('Content-Type', 'application/json').json(result);
};

const addBook = async (req, res) => {
	const bookToAdd = req.body;

	const result = await BookService.addBook(bookToAdd);

	if (result.err) {
		// eslint-disable-next-line max-len
		return res.status(400).set('Content-Type', 'application/json').json(result);
	}

	return res.status(201).set('Content-Type', 'application/json').json(result);
};

const updateBook = async (req, res) => {
	const bookToUpdate = req.body;
	const bookID = req.params.bookID;

	const result = await BookService.updateBook(bookID, bookToUpdate);

	if (result.err) {
		res
			.status(400)
			.set('Content-Type', 'application/json')
			.json(result);
		return;
	}

	return res.status(201).set('Content-Type', 'application/json').json(result);
};

const deleteBook = async (req, res) => {
	const result = await BookService.deleteBook(req.params.bookID);

	if (result.err) {
		res.status(400).set('Content-Type', 'application/json').json(result);
	}

	res.status(204).end();
};

module.exports = {
	getBooks: getBooks,
	getBook: getBook,
	addBook: addBook,
	updateBook: updateBook,
	deleteBook: deleteBook,
};
