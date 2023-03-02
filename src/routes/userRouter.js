const express = require('express');
const UserController = require('../controllers/userController');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/new', UserController.newUser);
router.post('/login', UserController.loginUser);

module.exports = router;
