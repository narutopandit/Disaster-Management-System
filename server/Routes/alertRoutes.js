const express = require("express");
const { authRole } = require("../middlewares/roleMiddleWare");
const { protect } = require("../middlewares/authMiddleware");
const { createAlert } = require("../controllers/alertController");
const router = express.Router();

router.post('/',protect,authRole("admin"),createAlert);

module.exports = router;