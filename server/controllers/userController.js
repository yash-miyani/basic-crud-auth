const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const NODE_ENV = process.env.NODE_ENV;
const JWT_SECRET = process.env.JWT_SECRET;

const handleRegister = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError(404, "Please provide all fields"));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(
      new ApiError(400, "Please another email choose this is already exist"),
    );
  }

  user = await User.create({
    name,
    email,
    password,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "User create successfully", user));
});

const handleLoginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.disabled === true) {
    return next(new ApiError(404, "User not found"));
  }

  if (
    email !== user.email ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return next(new ApiError(400, "Email and password doesn't match"));
  }

  const data = {
    user: {
      id: user._id,
    },
  };

  const token = jwt.sign(data, JWT_SECRET);

  const option = {
    httpOnly: true,
    secure: NODE_ENV === "development" ? false : true,
  };
  return res
    .status(200)
    .cookie("token", token, option)
    .json(
      new ApiResponse(200, "Login successfully....", {
        token,
      }),
    );
});

module.exports = {
  handleRegister,
  handleLoginUser,
};
