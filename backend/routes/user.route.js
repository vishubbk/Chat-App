import {
  Router
} from "express";

import * as userController from "../controllers/user.controllers.js";
import {
  body
} from "express-validator";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid  email address"),
  body("password")
  .isLength({
    min: 4,
  })
  .withMessage("Password must be at least 4 characters long"),
  userController.createUserController
);

// login route
router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid  email address"),
  body("password")
  .isLength({
    min: 4,
  })
  .withMessage("Password must be at least 4 characters long"),
  userController.loginUserController
);

// login route
router.get("/profile", authMiddleware, userController.getUserProfileController);

// logout route
router.get(
  "/logout",
  userController.logoutUserController
);

// all route
router.post("/all", authMiddleware,userController.getAllUserController);

export default router;