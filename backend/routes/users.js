// ROUTES pour les users

const express = require('express');
const auth = require("../middleware/auth");

const router = express.Router();

const userCtrl = require('../controllers/usersCtrl');

router.post('/users/signup/', userCtrl.signup);
router.post('/users/login/', userCtrl.login);
router.get('/users/me/', auth, userCtrl.getUserProfile);
router.put('/users/me/', auth, userCtrl.updateUserProfile);
router.delete('/users/me/', auth, userCtrl.deleteUserProfile);

module.exports = router;