// controllers/usersControllers.js
const express = require("express");
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const transporter = require("../config/emailService");
const {
  getVerificationEmailHTML,
  getEmailVerificationSuccessHTML,
  getInvalidTokenHTML,
  getMissingTokenHTML,
  getGenericVerificationErrorHTML
} = require('../utils/emailTemplates');

function generateVerificationToken(length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

exports.createUser = async (req, res) => {
  try {
    const { password, phone, email, username, address } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase letters, and numbers.",
      });
    }

    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone number already registered." });
    }

    if (email) {
      const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      username: username,
      phone: phone,
      ...(email && { email: email.toLowerCase() }),
      password: hashedPassword,
      role: "user",
      ...(address && { address: address }),
    };

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (email) {
      const verificationToken = generateVerificationToken();
      userData.verificationToken = verificationToken;
      userData.isVerified = false;
    }

    const user = new User(userData);
    const result = await user.save();

    let emailSent = false;
    if (email && result.email) {
      try {
        const verificationUrl = `${process.env.BASE_URL || req.protocol + '://' + req.get('host')}/api/auth/verify-email?token=${result.verificationToken}`;
        const mailOptions = {
          from: `"JOSAM" <${process.env.EMAIL_USER}>`,
          to: result.email,
          subject: 'Verify Your Email Address',
          html: getVerificationEmailHTML(result.username, verificationUrl),
        };
        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log('Verification email sent successfully to:', result.email);
      } catch (emailErr) {
        console.error('Error sending verification email:', emailErr);
      }
    }

    res.status(201).json({
      message: emailSent
        ? "Registration successful. Please check your email to verify your account before logging in."
        : "Registration successful, but we couldn't send the verification email. Please contact support or try resending verification later. You cannot log in yet.",
      userInfo: {
        id: result._id,
        phone: result.phone,
        email: result.email,
        role: result.role,
        username: result.username,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        isVerified: result.isVerified
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: "Validation Error",
        errors: messages
      });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0] || 'field';
      return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
    }
    res.status(500).json({
      message: "An error occurred during registration.",
      error: err.message || "Internal Server Error",
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(getMissingTokenHTML());
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send(getInvalidTokenHTML());
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).send(getEmailVerificationSuccessHTML(user.username));
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).send(getGenericVerificationErrorHTML());
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    let user = null;

    user = await User.findOne({ phone: identifier });
    if (!user) {
      user = await User.findOne({ email: identifier.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.email && user.email.toLowerCase() === identifier.toLowerCase() && !user.isVerified) {
      return res.status(401).json({ message: "Please verify your email address before logging in with email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    return res.status(200).json({
      message: "User login successful",
      token,
      userInfo: {
        id: user._id,
        phone: user.phone,
        email: user.email || null,
        role: user.role,
        username: user.username,
        isVerified: user.isVerified || false
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Something went wrong during login.",
      error: err.message || err.toString(),
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error while fetching users",
      error: err.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error while fetching user by ID",
      error: err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if ("role" in req.body) {
      delete req.body.role;
    }

    if (req.body.password) {
      if (!passwordRegex.test(req.body.password)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters, include uppercase, lowercase letters, and numbers.",
        });
      }
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    delete req.body.email;
    delete req.body.isVerified;
    delete req.body.verificationToken;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user",
      error: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const targetUser = await User.findById(userId);
    if (targetUser && targetUser.role === 'admin') {
      return res.status(403).json({ message: "You cannot delete admin users" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete user",
      error: err.message,
    });
  }
};