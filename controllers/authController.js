const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, companyName, address } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      companyName,
      address,
    });

   const userResponse = {
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  companyName: user.companyName,
  address: user.address,
};

res.status(201).json({
  success: true,
  message: "User Registered Successfully",
  user: userResponse,
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        address: user.address,
      },
    });
  } catch (error) {
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message,
  });
}
};
// Current User
const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    message: "Current User Route Working",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};