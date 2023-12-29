const express = require("express");
const {
  createUser,
  loginUser,
  checkAuth,
  resetPasswordReq,
  resetPassword,
  logout
} = require("../controllers/Auth");
const passport = require("passport");

const router = express.Router();

router
  .post("/signup", createUser)
  .post("/login", passport.authenticate("local"), loginUser)
  .get("/check", passport.authenticate("jwt"), checkAuth)
  .get("/logout", logout)
  .post("/reset-password-req", resetPasswordReq)
  .post("/reset-password", resetPassword);

module.exports = router;
