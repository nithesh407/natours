/* eslint-disable import/no-extraneous-dependencies */

const crypto = require('crypto');
const { promisify } = require('util'); //destructuring {promisify}
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendMail = require('../utils/email');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
    };
    
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    //Removes the password field from the response body 
    user.password = undefined;

    res
      .status(statusCode)
      .json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  };

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //creating a jwt token for the user
  createSendToken(newUser, 201, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.login = catchAsync(async (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;

  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
  }

  //2) check if user exits && password is correctnewUser._id

  // const user = User.findOne({email: email});
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }
  //3) If everything OK,send token to the client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and checking if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt){
    token = req.cookies.jwt;
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in, Please login to get access!', 401),
    );
  }

  //2) Verifiying token
  // promisify(jwt.verify) makes the function as a async and returns a promise
  //(token, process.env.JWT_SECRET) executes a function
  const decodedData = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  // console.log(decodedData);

  //3) check if user still exists
  const currentUser = await User.findById(decodedData.id);
  if (!currentUser) {
    return next(
      new AppError('User belonging to this token no longer exits!', 401),
    );
  }

  //4) check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decodedData.iat)) {
    return next(
      new AppError('Your password has changed, Please login again!', 401),
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; //will be usefull
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Your are not allowed to do that!', 403));
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1) GET USER-BASED on POSTed main
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  //2)Generate the random secret Token
  const resetToken = user.createPasswordResetToken();

  //validateBeforeSave will deactivate all the validators in the schema
  await user.save({ validateBeforeSave: false });

  //3)Send it to User's email
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password submit a patch request with your new password and passwordConfrim to : ${resetUrl} \n If you didn't forgot your password, please ignore this message!`;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset Token (Valid for 10 Min ONLY!)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'We have e-mailed your password reset link!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email, Try again later!', 500),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get User Based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2)If token has not expired, and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)update changePassword property for the user

  //4)Log the user in, send the JWT token
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get the user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2) check the user with the POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Current password is not Correct!', 401));
  }

  //3) If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) Log user in, send the JWT token
  createSendToken(user, 200, res);
});
