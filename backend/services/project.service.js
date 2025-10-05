import mongoose from "mongoose";
import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";


export const createProject = async ({name,userId}) => {
  try {
    if (!name || !userId) {
      throw new Error("Project name and userId are required");
    }

    const project = await projectModel.create({
      name,
      users: [userId]
    });
    console.log("project created", project)
    const users = await userModel.findById({
      _id: userId
    })
    if (!users) {
      throw new Error("User Do Not Exist");
    }
    users.projects.push(project._id);
    await users.save();


    return project;
  } catch (error) {
    console.log(error.message);
    throw new Error("Must be Unique name are Allowed");
  }
};

export const getAllProject = async (userId) => {
  try {
    if (!userId) {
      throw new Error("UserId is required");
    }
    const projects = await projectModel.find({
      users: userId
    }).populate('users').select('-password')
    if (!projects) {
      throw new Error("No project found for this user");
    }

    return projects;
  } catch (error) {
    throw new Error("Error fetching projects");
  }
};

export const addUsersToProject = async (projectId, users, userId) => {
  try {
    if (!projectId || !users || !Array.isArray(users)) {
      throw new Error("ProjectID and users are required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid Project ID");
    }

    const userExist = await projectModel.findOne({
      users: {
        $in: users
      }
    });
    if (userExist) {
      throw new Error("You can't add same Group again");
    }

    const projects = await projectModel.findByIdAndUpdate(
      projectId, {
        $addToSet: {
          users: {
            $each: users
          }
        }
      }, {
        new: true
      }
    );

    if (!projects) {
      throw new Error("Project not found");
    }

    // ✅ Now `userId` is a plain ObjectId
    const project = await projectModel.findOne({
      _id: projectId,
      users: userId,
    });
    if (!project) {
      throw new Error("User is not a member of this project");
    }

    return projects;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error fetching projects " + error.message);
  }
};

export const getAllUserFromProjectId = async (projectId) => {
  try {
    const project = await projectModel.findById(projectId)
    if (!project) {
      throw new Error({
        message: "Project not found"
      })
    }
    return project.users;

  } catch (error) {
    console.log(error.message);
    throw new Error("Error fetching User from projectId ")
  }
}

export const getProjectByOwner = async (userId) => {
  try {
    const projectsCreated = await userModel.findById(userId).populate('projects');
    if (!projectsCreated) {
      throw new Error({
        message: "No projects found"
      })
    }
    return projectsCreated.projects;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error fetching User from projectId ")

  }
}