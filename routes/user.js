const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
 
 


//// email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'firasyazid4@gmail.com',  
    pass: 'cntnhhvujdsfzhig'    
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});




router.post("/register", async (req, res) => {
  const { fullname, email, password, role, expiresAt } = req.body;

  if (!password || password.trim() === '') {
    return res.status(400).send("Password is required");
  }

  if (password.length < 8) {
    return res.status(400).send("Password must be at least 8 characters long");
  }

  if (!role || role.trim() === '') {
    return res.status(400).send("Role is required");
  }

  const allowedRoles = ['Super Admin', 'Teacher', 'Student'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).send(`Role must be one of the following: ${allowedRoles.join(', ')}`);
  }

  if (role === 'Student' && (!expiresAt || isNaN(Date.parse(expiresAt)))) {
    return res.status(400).send("Valid expiration date is required for users with the 'Student' role");
  }

  const expirationDate = role === 'Student' ? new Date(expiresAt) : undefined;

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
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Welcome to Your App!',
      text: `Hello ${user.fullname},\n\n` +
            `Your account has been successfully created!\n\n` +
            `Username: ${user.fullname}\n` +
            `Password: ${password}\n` +
            (role === 'Student' ? `Expiration Date: ${expiresAt}\n\n` : '') +
            `Thank you for joining us.`,
    };
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
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
}
);

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
      return res.status(400).send("User not found");
    }

     if (user.role === 'Student' && user.expiresAt && new Date() > new Date(user.expiresAt)) {
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

router.put('/update-password/:id', async (req, res) => {
  const { id } = req.params;
  const {newPassword } = req.body;

 
  if (!newPassword || newPassword.trim() === '') {
    return res.status(400).send("New password is required");
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }

     

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.send("Password updated successfully");
  } catch (error) {
    res.status(500).send("Server error");
  }
});
 
module.exports = router;
