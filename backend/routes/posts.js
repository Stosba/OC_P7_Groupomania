// ROUTES pour les posts

const express = require('express');
const router = express.Router();

const postsCtrl = require('../controllers/postsCtrl');

router.post('/posts/new', postsCtrl.createMessage);
router.get('/posts/', postsCtrl.listMessages);

module.exports = router;