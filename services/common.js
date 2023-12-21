const passport = require("passport");

exports.isAuth = (req, res, done) => {
  return passport.authenticate("jwt");
};

exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req, res, next) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2IwYTVkNzIyOWMzOTI0NmI4ZDhhNSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAyODA0MDM1fQ.WAYqcEUPuNm9cWNUHU9E2PRiOLQsLOx1GRq-ET7krNk";
  return token;
};
