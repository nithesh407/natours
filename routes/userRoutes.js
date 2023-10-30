const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../Controllers/userController");

router.route("/").get(getAllUsers).post(createUser);

router.route("/:userId").get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;