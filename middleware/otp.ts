import * as jwt from "jsonwebtoken";
import CONFIG from "../config";
import { PrismaClient } from ".prisma/client";
import { errRes } from "../util/utility.services";
const prisma = new PrismaClient();

export default async (req:any, res:any, next:any) => {
  // get the token
  const token = req.headers.token;
  if (!token) return errRes(res, "You need to register");
  // verify token

  try {
    let payload: any;
    payload = jwt.verify(token, CONFIG.jwtUserSecret);
    // get user
    let user = await prisma.user.findMany(payload.id);
    // check user isVerified
    // if (user.isVerified) return errRes(res, `You are already verified`);
    req.user = user;
    // next
    return next();
  } catch (error) {
    return errRes(res, error);
  }
};