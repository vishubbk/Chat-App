import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

async function authMiddleware(req, res, next) {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).send("Unauthorized User: No token provided");
    }

    const isBlackListed = await redisClient.get(token);
    if (isBlackListed) {
      res.cookie("token", "");
      return res.status(401).send("Unauthorized User");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send("Unauthorized User: Invalid token");
  }
}

export default authMiddleware;
