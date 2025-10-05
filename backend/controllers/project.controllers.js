import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import * as productServices from "../services/project.service.js";
import {
  validationResult
} from "express-validator";

// createProjectControllers  
export const createProjectControllers = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      error: error.array()
    });
  }
  try {
    const {
      name
    } = req.body;
    const userId = req.user.id;
    console.log("userId", userId);
    const project = await productServices.createProject({
      name,
      userId
    });
    res.status(201).json({
      project
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};


// getAllProjectsControllers
export const getAllProjectsControllers = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.find({
      _id: userId
    });
    if (!user) {
      throw new Error({
        message: "User not found"
      });
    }
    const projects = await productServices.getAllProject(userId);
    if (!projects) {
      throw new Error("No project found");
    }
    res.status(200).json({
      projects
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};


// addUserToProjectControllers
export const addUserToProjectControllers = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      error: error.array()
    });
  }
  try {
    const {
      projectId,
      users
    } = req.body;
    const loggedInUser = await userModel.findOne({
      email: req.user.email
    });
    if (!loggedInUser) {
      throw new Error("Logged in user not found");
    }
    const projects = await productServices.addUsersToProject(
      projectId,
      users,
      loggedInUser._id
    );

    res.status(200).json({
      projects
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};


//getUserFromProjectId
export const getUserFromProjectId = async (req, res) => {
  try {
    const {
      projectId
    } = req.params;
    console.log(projectId);
    if (!projectId) {
      throw new Error("ProjectId is required");
    }

    const project = await productServices.getAllUserFromProjectId(projectId);
    res.status(200).json({
      project
    });
  } catch (error) {
    res.status(400).send(error.message);
    console.log(error.message);
  }
};


//getProjectByOwnerControllers  
export const getProjectByOwnerControllers = async (req, res) => {
  try {
    console.log("Hit the getProjectByOwnerControllers ");
    
    const userId = req.user.id;
    console.log("userId", userId);
    
    const projectsCreated = await productServices.getProjectByOwner(userId);
    res.status(200).json({projectsCreated});
  } catch (error) {
    res.status(400).send(error.message);
    
  }
};