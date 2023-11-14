const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
} = require('../Controllers/userController');

const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout
} = require('../Controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout',logout);
router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect)

router.patch('/updateMyPassword',updatePassword)
router.get('/me',getMe,getUser)
router.patch('/updateMe',updateMe);
router.delete('/deleteMe',deleteMe);

router.use(restrictTo('admin'))

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
