// controllers/AdminController.js
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Đăng ký admin
exports.registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }
  if (!email.endsWith("@admin.com")) {
    return res.status(400).json({ message: "Email must end with @admin.com" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({
    username,
    email,
    passwordHash: hashedPassword,
    role: "admin",
  });
  await admin.save();
  res.status(201).json({ message: "Admin registered successfully", admin });
};

// Đăng nhập admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: admin._id, role: admin.role }, // Sử dụng role từ cơ sở dữ liệu
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: admin.role, // Trả về role từ cơ sở dữ liệu
      userId: admin._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy danh sách admin
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-passwordHash");
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "No admins found" });
    }
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error });
  }
};

// Cập nhật thông tin admin
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  // Kiểm tra nếu email đã tồn tại và không phải là email của admin hiện tại
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin && existingAdmin._id.toString() !== id) {
    return res
      .status(400)
      .json({ message: "Email already in use by another admin" });
  }

  const updateData = { username, email };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-passwordHash");
    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res
      .status(200)
      .json({ message: "Admin updated successfully", updatedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating admin", error });
  }
};

// Xóa admin
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const deletedAdmin = await Admin.findByIdAndDelete(id);
  if (!deletedAdmin) {
    return res.status(404).json({ message: "Admin not found" });
  }
  res.status(200).json({ message: "Admin deleted successfully" });
};

// Middleware xác thực admin
exports.isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng biến môi trường
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

const User = require("../models/User"); // Import model User

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash"); // Loại bỏ trường passwordHash
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
