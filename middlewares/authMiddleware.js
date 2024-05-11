import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import User  from "../models/userModel.js";
import dotenv from 'dotenv';


dotenv.config();
//protect routes
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("req.headers---protect------req.headers:",authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("dfdf");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.jwtSecret);
console.log("decode:",decoded);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not Authorized, no token");
  }
});

//admin middleware
const admin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log();
console.log("authHeaderauthHeader admin  in auth middlaware:",authHeader);
console.log(process.env.jwtSecret,"process.env.JWT_SECRETprocess.env.JWT_SECRET");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.jwtSecret);
console.log("decoded:",decoded);
      // Check if the decoded payload contains isAdmin property
      if (decoded.isAdmin) {
        // If user is an admin, set req.user and proceed
        req.user = await User.findById(decoded.userId).select("-password");
        next();
      } else {
        // If user is not an admin, return 401 Unauthorized
        return res.status(401).json({ message: "Not Authorized as admin" });
      }
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not Authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not Authorized, no token");
  }
});
export { protect, admin };
