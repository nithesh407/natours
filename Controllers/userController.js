const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields)=>{
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  })
  return newObj;
}

exports.updateMe = catchAsync(async(req, res, next) => {

  //1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not allowed to be update password', 400),
    );
  }
  
  //2)filtered out the unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body,'name','email');

  //3)update the user data
  //findByIdAndUpdate() is used because in the case of save() the required fields will need to passed
  const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new : true,
    runValidators: true,
  });

  res.status(200).json({
    status : 'success',
    data: {
      user: updatedUser
    }

  })
});

exports.deleteMe = catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id, {active: false})

  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.createUser = (req, res) => {
  const newUser = req.body;
  console.log(newUser);
  res.status(201).json({
    status: 'success',
    data: {
      User: newUser,
    },
  });
};

exports.getUser = (req, res) => {
  const userId = req.params.userId * 1; //changes string to number
  res.status(404).json({
    status: 'error',
    data: {
      user: `user not found for ${userId}`,
    },
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.userId * 1; //changes string to number
  console.log(userId);
  res.status(200).json({
    status: 'success',
    data: {
      user: `updated user with the id ${userId}`,
    },
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.userId * 1; //changes string to number
  console.log(userId);
  res.status(200).json({
    status: 'success',
    data: {
      user: `deleted user with the id ${userId}`,
    },
  });
};
