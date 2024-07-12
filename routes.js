const express = require("express");
const { User } = require("./users");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmailVerifier = require("email-verifier");
const apiKey = "at_YXvlLNCGZSE7J5ju9OyEor3sigUYy";
const verifier = new EmailVerifier(apiKey);

function checkMXRecord(email) {
  verifier.verify(email, (err, info) => {
    if (err) {
      console.log("Error:", err);
    } else {
      console.log("Verification result:", info);
    }
  });
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
   const containsLetter = /[a-zA-Z]/.test(password);
  const containsNumber = /\d/.test(password);

  return password.length >= 8 && containsLetter && containsNumber;
}

router.post(`/register`, async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!isValidEmail(email)) {
    return res.status(400).send("Invalid Email");
  }
if (!isValidPassword(password)) {
    return res.status(400).send("Password should contains number and letter and length should be greater than 8");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email address is already in use" });
  }

  try {
    let users = new User({
      email: req.body.email,
      password: req.body.password,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
    });

    users = await users.save();
    if (!users) {
      return res.status(500).send("The user cannot be created");
    }
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(`/`, async (req, res) => {
  try {
    const usersList = await User.find().select("-passwordHash");
    if (!usersList) {
      return res.status(500).json({ success: false });
    }
    res.json(usersList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(500).json({ success: false });
    }
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("The user not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.secret,
      { expiresIn: "1d" }
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wrong");
  }
});

router.post('/change-password', async (req, res) => {
  const email = req.body.email;
  const newPassword = req.body.newPassword;


  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    existingUser.password = newPassword;
    existingUser.passwordHash = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await existingUser.save();
    if (!updatedUser) {
      return res.status(500).send('Failed to update password');
    }

    res.send(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
 




module.exports = router;
