const express = require("express");
const { register, login } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authRole } = require("../middlewares/roleMiddleWare");

const router = express.Router();

router.get(
  "/admin-test",
  protect,
  authRole("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin!",
      user: req.user,
    });
  }
);
router.post("/register",register);
router.post("/login",login);

module.exports = router;