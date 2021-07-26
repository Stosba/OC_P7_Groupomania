// ROUTES pour les likes

const express = require('express');
const auth = require("../middleware/auth");

const router = express.Router();

const likesCtrl = require('../controllers/likesCtrl');

router.post('/posts/:messageId/vote/like', auth, likesCtrl.likePost);

module.exports = router;