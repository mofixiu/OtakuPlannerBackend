require("dotenv").config();
const { hash, compare } = require("bcrypt");
const Admin = require("../../models/Admin");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/secrets");

const storeAdmin = async (req, res) => {
  let { username, password } = req.body;
  const admin = Admin.fill({ username, password });
  admin.password = await hash(admin.password, 10);
  await admin.insert();
  res.json({
    status: "success",
    message: "Admin added successfully",
    data: admin,
  });
};

const getAdmins = async (req, res) => {
  const admins = await Admin.fetch();
  res.json({
    status: "success",
    message: "Admins fetched successfully",
    data: admins,
  });
};

const profile = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret());
    
    if (!decoded.admin) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    res.json({
      status: "success",
      message: "Admin profile fetched successfully",
      data: decoded.admin,
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

const getAdminById = async (req, res) => {
  let { id } = req.params;
  const admin = await Admin.find(id);
  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin not found",
    });
  }
  res.json({
    status: "success",
    message: "Admin fetched successfully",
    data: admin,
  });
};

const updateAdmin = async (req, res) => {
  let { id } = req.params;
  let { name, email, password } = req.body;
  const admin = await Admin.find(id);

  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin not found",
    });
  }
  admin.fill({ name, email });
  if (password) {
    admin.password = await hash(password, 10);
  }
  await admin.update();

  res.json({
    status: "success",
    message: "Admin updated successfully",
    data: admin,
  });
};

const partialAdminUpdate = async (req, res) => {
  let { id } = req.params;
  const admin = await Admin.find(id);
  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin not found",
    });
  }
  admin.fill(req.body);

  if (req.body.password) {
    admin.password = await hash(req.body.password, 10);
  }
  await admin.update();

  res.json({
    status: "success",
    message: "Admin updated successfully",
    data: admin,
  });
};

const deleteAdmin = async (req, res) => {
  let { id } = req.params;
  const deleted = await Admin.delete(id);
  if (!deleted) {
    return res.status(404).json({
      status: "error",
      message: "Failed to delete admin",
    });
  }

  res.json({
    status: "success",
    message: "Admin deleted successfully",
  });
};

const apiLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }
  // Check if the admin exists
  const admin = await Admin.findByEmail(email);
  if (!admin) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }
  // Check if the password is correct
  const isValidPassword = await compare(password, admin.password);
  if (!isValidPassword) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }
  // Generate a token
  const token = jwt.sign({ admin: admin }, jwtSecret(), { expiresIn: "1h" });
  // Send the token to the client
  res.json({
    status: "success",
    message: "Login successful",
    data: { token },
  });
};

const login = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    req.flash("Email and password are required", "error");
    return res.back();
  }
  let admin = await Admin.findByEmail(email);
  if (!admin || !(await compare(password, admin.password))) {
    req.flash("Incorrect email or password", "error");
  }
  req.session.admin = admin;
  req.flash("Login successful", "success");
  res.redirect("/admin/");
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      req.flash("Could not log out", "error");
      return res.back();
    }
    res.redirect("/login");
  });
};

module.exports = {
  storeAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  partialAdminUpdate,
  deleteAdmin,
  apiLogin,
  profile,
  login,
  logout,
};
