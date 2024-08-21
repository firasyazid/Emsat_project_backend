const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const generatePassword = require("generate-password");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
// Configure multer for handling file uploads
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, path.resolve(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });


//// email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "firasyazid4@gmail.com",
    pass: "cntnhhvujdsfzhig",
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

router.post("/register", async (req, res) => {
  const { fullname, email, password, role, expiresAt } = req.body;

  if (!password || password.trim() === "") {
    return res.status(400).send("Password is required");
  }

  if (password.length < 8) {
    return res.status(400).send("Password must be at least 8 characters long");
  }

  if (!role || role.trim() === "") {
    return res.status(400).send("Role is required");
  }

  const allowedRoles = ["Super Admin", "Teacher", "Student"];
  if (!allowedRoles.includes(role)) {
    return res
      .status(400)
      .send(`Role must be one of the following: ${allowedRoles.join(", ")}`);
  }

  if (role === "Student" && (!expiresAt || isNaN(Date.parse(expiresAt)))) {
    return res
      .status(400)
      .send(
        "Valid expiration date is required for users with the 'Student' role"
      );
  }

  const expirationDate = role === "Student" ? new Date(expiresAt) : undefined;

  let user = new User({
    fullname: fullname,
    email: email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role,
    expiresAt: expirationDate,
  });

  try {
    user = await user.save();
    if (!user) {
      throw new Error("User could not be created");
    }

    // Send email to the user
    const mailOptions = {
      from: "your-email@gmail.com",
      to: user.email,
      subject: "Welcome to Your Account!",
      text:
        `Hello ${user.fullname},\n\n` +
        `Your account has been successfully created!\n\n` +
        `Username: ${user.fullname}\n` +
        `Password: ${password}\n` +
        (role === "Student" ? `Expiration Date: ${expiresAt}\n\n` : "") +
        `Thank you for joining us.`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(400).send("The user could not be created");
  }
});

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});


router.get(`/last-user`, async (req, res) => {
  const userList = await User.find().select("-passwordHash").sort({ _id: -1 });

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(userList);
});


// Backend route to fetch users ordered by nearest expiresAt date
router.get(`/users-by-expiry`, async (req, res) => {
  try {
    const userList = await User.find()
      .select("-passwordHash")
      .sort({ expiresAt: 1 }); // Sort by expiresAt in ascending order (nearest first)

    if (!userList || userList.length === 0) {
      return res.status(404).json({ success: false, message: "Users not found" });
    }
    
    res.status(200).json(userList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
      return res.status(400).send("User not found");
    }

    if (
      user.role === "Student" &&
      user.expiresAt &&
      new Date() > new Date(user.expiresAt)
    ) {
      return res.status(400).send("Your account has expired");
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        secret,
        { expiresIn: "1d" }
      );

      res.status(200).send({
        user: user.email,
        userId: user.id,
        token: token,
        fullname: user.fullname,
        role: user.role,
      });
    } else {
      res.status(400).send("Password is incorrect");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/// update password

router.put("/update-password/:id", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim() === "") {
    return res.status(400).send("New password is required");
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    await user.save();
    const mailOptions = {
      from: "firasyazid4@gmail.com",
      to: user.email,
      subject: "Password Reset",
      text:
        `Hello ${user.fullname},\n\n` +
        `Your password has been reset successfully.\n\n` +
        `New Password: ${newPassword}\n\n` +
        `Welcome again.`,
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to send email" });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .json({
            message:
              "Password reset successful. New password sent to the user.",
          });
      }
    });

    res.send("Password updated successfully");
  } catch (error) {
    res.status(500).send("Server error");
  }
});

///forget password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new random password
    const newPassword = generatePassword.generate({
      length: 8,
      numbers: true,
      strict: true,
      uppercase: false,
    });

    const passwordHash = bcrypt.hashSync(newPassword, 10);

    user.passwordHash = passwordHash;
    user.role = "Student";
    try {
      await user.save();
    } catch (error) {
      if (
        error.errors &&
        error.errors.role &&
        error.errors.role.kind === "enum"
      ) {
        return res
          .status(400)
          .json({ message: `Invalid role value: ${user.role}` });
      }
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to update user password" });
    }

    const mailOptions = {
      from: "firasyazid4@gmail.com",
      to: user.email,
      subject: "Password Reset",
      text:
        `Hello ${user.fullname},\n\n` +
        `Your password has been reset successfully.\n\n` +
        `New Password: ${newPassword}\n\n` +
        `Welcome again.`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to send email" });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .json({
            message:
              "Password reset successful. New password sent to the user.",
          });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


 //delete user by id 

 router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
);




// PUT route to update user details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fullname, email, expiresAt, role } = req.body;

   if (role && !['Super Admin', 'Teacher', 'Student'].includes(role)) {
      return res.status(400).send({ error: 'Invalid role' });
  }

  try {
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).send({ error: 'User not found' });
      }

      if (fullname) user.fullname = fullname;
      if (email) user.email = email;
      if (expiresAt) user.expiresAt = expiresAt;
      if (role) user.role = role;

      await user.save();
      res.send(user);
  } catch (error) {
      res.status(500).send({ error: 'An error occurred while updating the user' });
  }
});



router.get('/search', async (req, res) => {
  const searchTerm = req.query.q;  
  if (!searchTerm) {
      return res.status(400).send('Search term is required');
  }

  try {
      const regex = new RegExp(searchTerm, 'i');   
      const users = await User.find({ fullname: regex });
      if (users.length === 0) {
          return res.status(404).send('No users found');
      }
      res.json(users);
  } catch (error) {
      res.status(500).send('Server error');
  }
});



router.get('/total', async (req, res) => {
  try {
    const count = await User.countDocuments(); // Directly get the count of documents
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const getMonthName = (date) => {
  return date.toLocaleString('default', { month: 'long' });
};

router.get('/expiration-stats', async (req, res) => {
  try {
    // Fetch all users with a non-null expiration date
    const users = await User.find({ expiresAt: { $ne: null } });

    // Get the total number of users with an expiration date
    const totalUsers = users.length;

    // Count the number of users per month
    const monthCount = users.reduce((acc, user) => {
      const month = getMonthName(user.expiresAt);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Transform the month counts into the desired response format
    const monthData = Object.keys(monthCount).map(month => {
      return {
        month,
        count: monthCount[month]  // Change 'percentage' to 'count'
      };
    });

    // Send the response
    res.json(monthData);
  } catch (err) {
    // Handle any errors
    res.status(500).send(err.message);
  }
});



router.get('/user-role-percentage', async (req, res) => {
  try {
      // Get total number of users
      const totalUsers = await User.countDocuments();

      // If no users are present, return 0% for each role
      if (totalUsers === 0) {
          return res.json({
              "Super Admin": 0,
              "Teacher": 0,
              "Student": 0
          });
      }

      // Get count of users per role
      const roleCounts = await User.aggregate([
          {
              $group: {
                  _id: "$role",
                  count: { $sum: 1 }
              }
          }
      ]);

      // Create a map for role counts
      const roleMap = roleCounts.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
      }, {});

      // Calculate percentages
      const percentages = {
          "Super Admin": ((roleMap["Super Admin"] || 0) / totalUsers) * 100,
          "Teacher": ((roleMap["Teacher"] || 0) / totalUsers) * 100,
          "Student": ((roleMap["Student"] || 0) / totalUsers) * 100
      };

      // Send response
      res.json(percentages);

  } catch (error) {
      console.error('Error fetching user role percentages:', error);
      res.status(500).send('Internal Server Error');
  }
});

///// email
router.post('/send-email', uploadOptions.single('file'), async (req, res) => {
  try {
    const { text, subject, email } = req.body;
    const file = req.file;
    let filePath = '';

    if (file) {
      filePath = path.resolve(__dirname, '../public/uploads', file.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found.');
      }
    }

    const mailOptions = {
      from: 'firasyazid4@gmail.com',
      to: email,
      subject: subject,
      text: `${text}\n\nEMSAT Team`,
      attachments: file ? [{ filename: file.originalname, path: filePath }] : []
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email', error });
      } else {
        if (file) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error removing file:', err);
            }
          });
        }
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});



module.exports = router;
