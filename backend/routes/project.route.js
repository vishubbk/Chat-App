import {
  Router
} from "express"

import * as projectController from "../controllers/project.controllers.js"
import {body} from "express-validator"
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/create", authMiddleware,
  body("name").isString().withMessage("Name is required"),
  projectController.createProjectControllers);


router.get("/all", authMiddleware,
  projectController.getAllProjectsControllers);


router.put("/add-user", authMiddleware,
  body("users")
  .isArray({
    min: 1
  })
  .withMessage("Users must be a non-empty array")
  .bail()
  .custom((arr) => arr.every((u) => typeof u === "string"))
  .withMessage("Each user must be a string"),

  projectController.addUserToProjectControllers);

router.get("/get-project-users/:projectId", authMiddleware,
  projectController.getUserFromProjectId);


router.get("/get-project-by-owner", authMiddleware,
  projectController.getProjectByOwnerControllers);


router.delete("/delete/:projectId", authMiddleware,
  projectController.deleteProjectByControllers);


router.put("/update/:projectId", authMiddleware,
  projectController.updateProjectByControllers);


router.get("/getProjectusers/:projectId", authMiddleware,
  projectController.ProjectusersProjectByControllers);


router.put("/removeUser/:projectId", authMiddleware,
  projectController.removeUserProjectByControllers);


export default router;