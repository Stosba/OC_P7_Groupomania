// ROUTES pour les posts

const express = require('express');
const multer = require("../middleware/multer-config");
const auth = require("../middleware/auth");

const router = express.Router();

const postsCtrl = require('../controllers/postsCtrl');

router.post('/posts/new', auth, postsCtrl.createMessage);
router.get('/posts/', postsCtrl.listMessages);
router.get('/posts/user/:id', auth, multer, postsCtrl.getUserMessage);
router.delete('/posts/:id', auth, multer, postsCtrl.deleteMessage);
// router.put('/posts/:id/moderate', postsCtrl.moderateMessage);
router.put('/posts/:id', auth, multer, postsCtrl.updateMessage);

module.exports = router;