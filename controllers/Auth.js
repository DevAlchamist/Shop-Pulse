const userModel = require("../models/User");
const crypto = require("crypto");
const { sanitizeUser, sendMail, ResetSuccess, ResetReq } = require("../services/common");
const SECRET_KEY = "SECRET_KEY";
const jwt = require("jsonwebtoken");
const { userInfo } = require("os");
require("dotenv").config();

const createUser = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new userModel({
          ...req.body,
          password: hashedPassword,
          salt,
        });
        const doc = await user.save();
        req.login(sanitizeUser(doc), () => {
          if (err) {
            res.status(400).json();
          } else {
            const token = jwt.sign(
              sanitizeUser(doc),
              process.env.JWT_SECRET_KEY
            );
            res
              .cookie("jwt", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
              })
              .status(200)
              .json({ id: doc.id, role: doc.role });
          }
        });
      }
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

const loginUser = async (req, res) => {
  const user = req.user;
  res
    .cookie("jwt", user.token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    })
    .status(200)
    .json({ id: user.id, role: user.role });
};

const logout = async (req, res) => {
  const user = req.user;
  res
    .cookie("jwt", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .sendStatus(200)
};

const checkAuth = async (req, res) => {
  if (req.user) {
    res.json({ status: "success", user: req.user });
  } else {
    res.sendStatus(401);
  }
};

const resetPasswordReq = async (req, res) => {
  const email = req.body.email;
  const user = await userModel.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(48).toString("hex");
    user.resetPasswordToken = token;
    await user.save();
    const resetPageLink =
      "http://localhost:3000/reset-password?token=" + token + "&email=" + email;
    const subject = "reset password for shop pulse";
    const html = ResetReq(resetPageLink);

    if (email) {
      const response = await sendMail({
        to: email,
        subject: subject,
        html,
      });
      res.json(response);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
};

const resetPassword = async (req, res) => {
  const { email, password, token } = req.body;
  console.log({email,password,token});
  const user = await userModel.findOne({
    email: email,
    resetPasswordToken: token,
  });
  if (user) {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        user.password = hashedPassword;
        user.salt = salt;
        await user.save();
        const subject = `Successfully changed password for shop pulse`;
        const html = ResetSuccess(email);
        if (email) {
          const response = await sendMail({
            to: email,
            subject: subject,
            html,
          });
          res.json(response);
        } else {
          res.sendStatus(400);
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
};

module.exports = {logout, resetPassword, checkAuth, createUser, loginUser, resetPasswordReq };
