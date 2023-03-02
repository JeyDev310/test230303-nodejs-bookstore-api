const getBooks = (Model) => async () => {
	try {
		return await Model.find({});
	} catch (err) {
		console.error(err);
		return {err: err.message};
	}
};

const getBook = (Model) => async (bookID) => {
	try {
		return await Model.find({_id: bookID});
	} catch (err) {
		console.error(err);
		return {err: err.message};
	}
};

const addBook = (Model) => async (bookObj) => {
	let bookToAdd = new Model(bookObj);

	try {
		bookToAdd = await bookToAdd.save();
	} catch (err) {
		console.error(err);
		return {err: err.message};
	}

	return bookToAdd;
};

const updateBook = (Model) => async (bookID, bookObj) => {
	let book = null;

	try {
		book = await Model.findOne({_id: bookID});
	} catch (err) {
		return {err: err.message};
	}

	if (!book) {
		return {err: 'Book to update not found'};
	}

	let updateResult = null;

	try {
		updateResult = await Model.updateOne({_id: bookID}, bookObj);
	} catch (err) {
		return {err: err.message};
	}

	if (updateResult.modifiedCount == 1) {
		return bookObj;
	} else {
		return {err: 'No books were updated'};
	}
};

const deleteBook = (Model) => async (bookID) => {
	let book = null;

	try {
		book = await Model.findOne({_id: bookID});
	} catch (err) {
		console.error(err);
		return {err: err.message};
	}

	if (!book) {
		return {err: 'Book to delete not found'};
	}

	let deleteResult = null;

	try {
		deleteResult = await Model.deleteOne({_id: bookID});
	} catch (err) {
		console.error(err);
		return {err: err.message};
	}

	if (deleteResult.deletedCount == 1) {
		return true;
	} else {
		return {err: 'No books were deleted'};
	}
};

module.exports = (BookModel) => {
	return {
		getBooks: getBooks(BookModel),
		getBook: getBook(BookModel),
		addBook: addBook(BookModel),
		updateBook: updateBook(BookModel),
		deleteBook: deleteBook(BookModel),
	};
};
