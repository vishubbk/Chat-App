import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import * as productServices from "../services/project.service.js";
import { validationResult } from "express-validator";

// createProjectControllers
export const createProjectControllers = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      error: error.array(),
    });
  }
  try {
    const { name } = req.body;
    const userId = req.user.id;
    const project = await productServices.createProject({
      name,
      userId,
    });
    res.status(201).json({
      project,
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
      _id: userId,
    });
    if (!user) {
      throw new Error({
        message: "User not found",
      });
    }
    const projects = await productServices.getAllProject(userId);
    if (!projects) {
      throw new Error("No project found");
    }
    res.status(200).json({
      projects,
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
      error: error.array(),
    });
  }
  try {
    const { projectId, users } = req.body;
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
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
      projects,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//getUserFromProjectId
export const getUserFromProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      throw new Error("ProjectId is required");
    }

    const project = await productServices.getAllUserFromProjectId(projectId);
    res.status(200).json({
      project,
    });
  } catch (error) {
    res.status(400).send(error.message);
    console.log(error.message);
  }
};

//getProjectByOwnerControllers
export const getProjectByOwnerControllers = async (req, res) => {
  try {
    const userId = req.user.id;

    const projectsCreated = await productServices.getProjectByOwner(userId);
    res.status(200).json({ projectsCreated });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//deleteProjectByControllers
export const deleteProjectByControllers = async (req, res) => {
  try {
    const { projectId } = req.params; // 👈 get id from URL
    const deletedProject = await projectModel.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//updateProjectByControllers
export const updateProjectByControllers = async (req, res) => {
  try {
    const { projectId } = req.params; // 👈 get id from URL
    const renameProject = await projectModel.findByIdAndUpdate(
      projectId,
      req.body,
      { new: true }
    );
    if (!renameProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};


// ✅ ProjectusersProjectByControllers (using $ne)
export const ProjectusersProjectByControllers = async (req, res) => {
  try {
    const currentUser = await userModel.findOne({ email: req.user.email });
    const { projectId } = req.params;

    // 🔹 Find project and populate only users except current user
    const project = await projectModel.findById(projectId).populate({
      path: "users",
      match: { _id: { $ne: currentUser._id } }, // ✅ exclude current user
      select: "name email", // optional: return only required fields
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project users fetched successfully (excluding current user)",
      users: project.users, // already filtered
    });
  } catch (error) {
    console.error("Error fetching project users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project users",
      error: error.message,
    });
  }
};



//removeUserProjectByControllers
export const removeUserProjectByControllers = async (req, res) => {
  try {
    const { projectId } = req.params; // 👈 get id from URL
    const userId = req.user.id; // 👈 get user id from auth middleware
    const removedUser =  await projectModel.findByIdAndUpdate(
      projectId,
      { $pull: {users:userId}}
      ,{new:true}
      
    )
    if (!removedUser) {
      return res.status(404).json({ message: "Project or User not found" });
    }
    res.status(200).json({ message: "User removed  successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};
