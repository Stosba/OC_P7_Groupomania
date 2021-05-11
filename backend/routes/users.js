// ROUTES pour les users

const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/usersCtrl');

router.post('/users/signup/', userCtrl.signup);
router.post('/users/login/', userCtrl.login);
router.get('/users/me/', userCtrl.getUserProfile);
router.put('/users/me/', userCtrl.updateUserProfile);

module.exports = router;