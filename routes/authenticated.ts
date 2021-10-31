import AuthController from "../controllers/v1/userController";
import otp from "../middleware/otp";
const express = require("express");

const route = express.Router();

// not auth
route.post("register/", AuthController.register);
route.post("/otp", otp, AuthController.checkOtp);
route.post("/login", AuthController.login);

export default route;
