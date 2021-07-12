const express = require("express");
const auth = require("../middleware/auth");
const commentCtrl = require("../controllers/commentCtrl");
const router = express.Router();

// Routes

router.post("/posts/:id/comment", auth, commentCtrl.createComment);
router.get("/posts/:id/comments", auth, commentCtrl.getComments);
router.delete("/posts/:id/comment/:id", auth, commentCtrl.deleteComment);

module.exports = router;