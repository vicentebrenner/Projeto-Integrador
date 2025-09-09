const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-request', authController.registerRequest);
router.post('/verify-code', authController.verifyCode);
router.post('/login', authController.login);

module.exports = router;