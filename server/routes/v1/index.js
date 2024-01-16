const express = require("express");
const {
  UserController
} = require("../../controllers/index");

const router = express.Router();

router.post("/signup", UserController.signUp);
router.get("/all", UserController.allUsers)


module.exports = router;