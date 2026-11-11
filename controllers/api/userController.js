const User = require("../../models/User");
const { hash, compare } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/secrets");

const createTestUser = async (req, res) => {
  try {
    const hashedPassword = await hash("123456", 10);

    const user = User.fill({
      username: "testuser",
      email: "test@test.com",
      password: hashedPassword,
    });

    await user.save();

    res.json({
      status: "success",
      message: "Test user created",
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create test user",
    });
  }
};
// const storeUser = async (req, res) => {
//     let { username, email, password } = req.body;
//     const user = User.fill({ username, email, password });
//     if (req.files?.profileImage) {
//         const { profileImage } = req.files;
//         const fileName = `${Date.now()}-${profileImage.name}`;
//         const filePath = `uploads/users/${fileName}`;
//         await profileImage.mv(filePath);
//         user.profileImage = filePath;
//     }
//     await user.save()
//     res.json(
//         {
//             status: 'success',
//             message: 'User added successfully',
//             data: user
//         }
//     )
// }const User = require('../../models/User')
//
//;
// const userLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Email and password are required",
//             });
//         }

//         console.log('=== LOGIN DEBUG ===');
//         console.log('Attempting user login for:', email);
//         console.log('Password provided:', password); // Remove this in production

//         // Find user by email
//         const user = await User.findByEmail(email);
//         console.log('User found:', user ? 'YES' : 'NO');

//         if (user) {
//             console.log('User ID:', user.id);
//             console.log('User email:', user.email);
//             console.log('Stored password hash:', user.password); // Remove this in production
//             console.log('Password hash length:', user.password ? user.password.length : 'null');
//         }

//         if (!user) {
//             console.log('No user found with email:', email);
//             return res.status(401).json({
//                 status: "error",
//                 message: "Invalid email or password",
//             });
//         }

//         // Check if password is correct with debugging
//         console.log('Comparing passwords...');
//         console.log('Plain password:', password);
//         console.log('Stored hash:', user.password);

//         const isValidPassword = await compare(password, user.password);
//         console.log('Password comparison result:', isValidPassword);

//         if (!isValidPassword) {
//             console.log('Password comparison failed for user:', email);
//             return res.status(401).json({
//                 status: "error",
//                 message: "Invalid email or password",
//             });
//         }

//         // Generate JWT token
//         const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
//         const token = jwt.sign(
//             {
//                 userId: user.id,
//                 email: user.email,
//                 username: user.username
//             },
//             JWT_SECRET,
//             { expiresIn: "24h" }
//         );

//         console.log('User login successful for:', email);
//         console.log('=== END LOGIN DEBUG ===');

//         // Send response
//         res.json({
//             status: "success",
//             message: "Login successful",
//             data: {
//                 token,
//                 user: {
//                     id: user.id,
//                     username: user.username,
//                     email: user.email
//                 }
//             },
//         });
//     } catch (error) {
//         console.error('User login error:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Login failed',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check if password is correct
    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const JWT_SECRET = jwtSecret();
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      // Long enough that phone users aren't logged out every day.
      { expiresIn: "30d" }
    );

    console.log('Login successful for:', email);

    // Format the created_at date properly
    let formattedCreatedAt = null;
    if (user.created_at) {
      try {
        const date = new Date(user.created_at);
        // Format as ISO string for consistent parsing
        formattedCreatedAt = date.toISOString();
        console.log('Formatted created_at:', formattedCreatedAt);
      } catch (e) {
        console.log('Error formatting created_at date:', e);
        formattedCreatedAt = new Date().toISOString(); // Fallback to current date
      }
    }

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName || user.full_name, // Handle both field names
          created_at: formattedCreatedAt,
        },
      },
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed. Please try again.",
    });
  }
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

// const storeUser = async (req, res) => {
//     try {
//         let { username, email, password } = req.body;

//         // Validate required fields
//         if (!username || !email || !password) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Username, email, and password are required'
//             });
//         }

//         console.log('Creating user with data:', { username, email }); // Don't log password
//          user.password = await hash(User.password, 10);
//         const user = User.fill({ username, email, password });

//         if (req.files?.profileImage) {
//             const { profileImage } = req.files;
//             const fileName = `${Date.now()}-${profileImage.name}`;
//             const filePath = `uploads/users/${fileName}`;
//             await profileImage.mv(filePath);
//             user.profileImage = filePath;
//         }

//         await user.save();

//         console.log('User created successfully:', user.id);

//         res.status(201).json({
//             status: 'success',
//             message: 'User added successfully',
//             data: {
//                 id: user.id,
//                 username: user.username,
//                 email: user.email
//                 // Don't return password
//             }
//         });
//     } catch (error) {
//         console.error('Error creating user:', error);

//         // Handle specific database errors
//         if (error.code === 'ER_DUP_ENTRY') {
//             return res.status(409).json({
//                 status: 'error',
//                 message: 'User with this email already exists'
//             });
//         }

//         if (error.code === 'ER_NO_SUCH_TABLE') {
//             return res.status(500).json({
//                 status: 'error',
//                 message: 'Database table not found. Please contact administrator.'
//             });
//         }

//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to create user account',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };
const storeUser = async (req, res) => {
  try {
    let { username, email, password, fullName } = req.body;

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        status: "error",
        message: "Username, email, password, and fullName are required",
      });
    }

    console.log("Creating user with data:", { username, email, fullName });

    // Hash the password BEFORE creating the user
    const hashedPassword = await hash(password, 10);

    const user = User.fill({
      username,
      email,
      password: hashedPassword,
      full_name: fullName, // Change from 'fullName' to 'full_name' if that's your column name
    });

    if (req.files?.profileImage) {
      const { profileImage } = req.files;
      const fileName = `${Date.now()}-${profileImage.name}`;
      const filePath = `uploads/users/${fileName}`;
      await profileImage.mv(filePath);
      user.profileImage = filePath;
    }

    await user.save();

    console.log("User created successfully:", user.id);

    res.status(201).json({
      status: "success",
      message: "User added successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle specific database errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        status: "error",
        message: "Database table not found. Please contact administrator.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create user account",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getUsers = async (req, res) => {
  const users = await User.fetch();
  res.json({
    status: "success",
    message: "Users fetched successfully",
    data: users,
  });
};

const getUserById = async (req, res) => {
  let { id } = req.params;
  const user = await User.find(id);
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }
  res.json({
    status: "success",
    message: "User fetched successfully",
    data: user,
  });
};

// const updateUser = async (req, res) => {
//     let { id } = req.params;
//     let { name, description, tuition } = req.body;
//     const user = await User.find(id);
//     if (!user) {
//         return res.status(404).json(
//             {
//                 status: 'error',
//                 message: 'User not found'
//             }
//         )
//     }
//     user.fill({ name, description, tuition });

//     await user.update();

//     res.json(
//         {
//             status: 'success',
//             message: 'User updated successfully',
//             data: user
//         }
//     )
// }

const partialUserUpdate = async (req, res) => {
  let { id } = req.params;
  const user = await User.find(id);
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }
  user.fill(req.body);

  await user.update();

  res.json({
    status: "success",
    message: "User updated successfully",
    data: user,
  });
};

const deleteUser = async (req, res) => {
  let { id } = req.params;
  const deleted = await User.delete(id);
  if (!deleted) {
    return res.status(404).json({
      status: "error",
      message: "Failed to delete user",
    });
  }

  res.json({
    status: "success",
    message: "User deleted successfully",
  });
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Getting profile for user ID:', userId);
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid User ID format'
      });
    }
    
    // Get user basic info
    const user = await User.findById(userIdNum);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get user statistics
    const statistics = await User.getUserStatistics(userIdNum);
    
    res.json({
      status: 'success',
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName || user.full_name,
          created_at: user.created_at,
        },
        statistics: statistics
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Alternative: Just get completed tasks count
const getCompletedTasksCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid User ID format'
      });
    }
    
    const completedCount = await User.getCompletedTasksCount(userIdNum);
    
    res.json({
      status: 'success',
      message: 'Completed tasks count retrieved successfully',
      data: {
        completedTasks: completedCount
      }
    });
  } catch (error) {
    console.error('Error getting completed tasks count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get completed tasks count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  storeUser,
  getUsers,
  getUserById,
  // updateUser,
  partialUserUpdate,
  deleteUser,
  apiLogin,
  userLogin,
  createTestUser,
  getUserProfile,
  getCompletedTasksCount
};
