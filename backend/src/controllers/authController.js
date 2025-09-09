const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { sendVerificationEmail } = require('../services/emailService');

exports.registerRequest = async (req, res) => { /* ... sua lógica de /register-request ... */ };
exports.verifyCode = async (req, res) => { /* ... sua lógica de /verify-code ... */ };
exports.login = async (req, res) => { /* ... sua lógica de /login ... */ };