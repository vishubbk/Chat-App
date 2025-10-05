import userModel from '../models/user.model.js'
import projectModel from '../models/project.model.js'
import userService from '../services/user.service.js'
import {validationResult} from "express-validator"
import redisClient from '../services/redis.service.js'


export const createUserController = async (req,res) => {

  const error = validationResult(req)
  if (!error.isEmpty()) {
    return res.status(400).json({error:error.array()});
  }
  try {
    const user = await userService.createUser(req.body)
    const token = await userModel.generateJWT()
    res.status(201).json({user,token})
  } catch (error) {
    res.status(400).send(error.message)
  }
}

export const loginUserController = async (req,res) => {

  const error = validationResult(req)
  if (!error.isEmpty()) {
    return res.status(400).json({error:error.array()});
  }
  try {
    const {email,password} = req.body
    const user = await userModel.findOne({email})
    if (!user) {
      return res.status(400).send("USER NOT FOUND")
    }
    
    const validPassword = await userModel.isValidPassword.call(user,password)
    if (!validPassword) {
      return res.status(400).send("INVALID PASSWORD")
    }
    
    const token = await userModel.generateJWT.call(user)

    res.status(200).json({user,token})
  } catch (error) {
    res.status(400).send(error.message)
  }
}


export const getUserProfileController = async  (req,res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(400).send("USER NOT FOUND")
    }
    res.status(200).json({user})
  } catch (error) {
    res.status(400).send(error.message)
  }
}


export const logoutUserController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // ✅ blacklist token for 24 hours
    await redisClient.set(
      token,'logout', "EX", 24 * 60 * 60,
      
    );

    res.clearCookie("token", { httpOnly: true, secure: true });
    res.status(200).json({ message: "LOGOUT SUCCESS" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};


export const getAllUserController = async (req, res) => {
  try {
    // Logged-in user nikal lo
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    if (!loggedInUser) {
      return res.status(404).json({ message: "Logged-in user not found" });
    }

    const { projectId } = req.body;
    console.log(`req.body: ${req.body}`);
    
    if(!projectId){
      return res.status(404).json({ message: "Project not found" });
    }

    // Project nikal lo
    const project = await projectModel.findOne({ _id: projectId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Sare project ke andar ke userIds
    const userIdsInProject = project.users.map(id => id.toString());

    // Sare users nikal lo except loggedInUser + except project ke andar wale
    const users = await userModel
      .find({ 
        _id: { 
          $ne: loggedInUser._id,       // logged in user exclude
          $nin: userIdsInProject       // project ke users exclude
        } 
      })
      .select("-password");
      console.log(`users is added:${users}`)

    res.status(200).json({ users });
  } catch (error) {
    console.log(error.message)
    res.status(400).send(error.message);
  }
};



 