const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
} = require('../Controllers/userController');

const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('../Controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword',protect,updatePassword)

router.patch('/updateMe',protect,updateMe);
router.delete('/deleteMe',protect,deleteMe);


router.route('/').get(getAllUsers).post(createUser);

router.route('/:userId').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;
