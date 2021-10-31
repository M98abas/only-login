import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { errRes, getOtp, okRes } from "../../util/utility.services";
import Validator from "../../util/validation";
import CONFIG from "../../config";
import { PrismaClient } from ".prisma/client";
const validate = require("validate.js");
const prisma = new PrismaClient();
export default class AuthController {
  /**
   *
   * @param request
   * @param response
   */
  static async register(req: Request, res: Response): Promise<object> {
    // get the body
    const body = req.body;
    // validate the req
    let notValid = validate(body, Validator.register());
    if (notValid) return errRes(res, notValid);

    // format to the number
    let phone = body.phone;
  
    // hash the password
    let salt = await bcrypt.genSalt(12);
    let password = await bcrypt.hash(body.password, salt);
    // create otp
    let otp = getOtp();
    body.password = password;
    body.otp = otp;

    // check if the user already exists
    let user:any;
    user = await prisma.user.findMany({ where: { phone } });
    // if exists but not verified
    if (user) {
      if (!user.isVerified) {
        Object.keys(body).forEach((key) => {
          user[key] = body[key];
        });
      } else return errRes(res, `User ${phone} is already exist`);
    } else {
      user = await prisma.user.create({
        data: {
          email: body.email,
          phone: body.phone,
          password: body.password,
          name: body.name,
          otp: body.otp,
        },
      });
    }
    // send sms

    let token = jwt.sign({ phone: user.phone }, CONFIG.jwtUserSecret);

    // return res
    return okRes(res, { token });
  }
  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async checkOtp(req:any, res:any): Promise<object> {
    // get the otp from body
    let body = req.body;
    let otp = body.otp;
    if (!otp) return errRes(res, `Otp is required`);
    // check if they are the same DB
    let user = req.user;

    // if not -> delete the otp from DB + ask user to try again
    if (user.otp != otp) {
      user.otp = null;
      return errRes(res, "otp is incorrect");
    }
    // if yes -> isVerified = true
    user.isVerified = true;
    await user.save();
    // return res
    return okRes(res, { user });
  }

  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async login(req:any, res:any): Promise<object> {
    // get body
    let body = req.body;
    // verify body
    let notValid = validate(body, Validator.login());
    if (notValid) return errRes(res, notValid);

    // format to the number
    let phone = body.phone;
   
    // get user from db by phone + isVerified
    let [user] = await prisma.user.findMany({
      where: { phone, isVerified: true },
    });
    if (!user) return errRes(res, `Please complete the registration process`);

    // compaire the password
    let check = await bcrypt.compare(body.password, user.password);
    if (!check) return errRes(res, "Incorrect credentials");

    // token
    let token = jwt.sign({ phone: user.phone }, CONFIG.jwtUserSecret);

    // return token
    return okRes(res, { token, user });
  }
}
