const userModel = require("../models/User");
const crypto = require("crypto");
const { sanitizeUser } = require("../services/common");
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

const checkAuth = async (req, res) => {
  if (req.user) {
    res.json({ status: "success", user: req.user });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { checkAuth, createUser, loginUser };
