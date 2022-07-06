const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  // if (token === undefined){
  //   return res.status(200).json("no token")
  // }
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        // res.cookie("jwt", "", { maxAge: 1 });
        next();
      } else {
        let user = await UserModel.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  // if (token === undefined){
  //   return res.status(200).json("no token")
  // }
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        // console.log(err);
        res.status(403).json("invalid token");
        next();
      } else {
        res.status(200).send(decodedToken.id);
        next();
      }
    });
  } else {
    res.status(401).json("authentication error");
  }
};
