const express = require("express");
const {
  UserController
} = require("../../controllers/index");

const router = express.Router();

router.post("/signup", UserController.signUp);
router.post("/signin", UserController.signIn);
router.get("/signout", UserController.signOut);
router.get("/refresh", UserController.handleRefreshToken);


module.exports = router;