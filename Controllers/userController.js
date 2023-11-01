exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      Users: '<total users>',
    },
  });
};

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
