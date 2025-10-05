import userModel from '../models/user.model.js'

export const createUser = async ({email,password}) => {
  if (!email||!password) {
    throw new Error('EMAIL AND PASSWORD MUST BE REQUIERD')
    
  }
  const hashedPassword  = await userModel.hashPassword(password)
  const user = await userModel.create({
    email,
    password:hashedPassword
  });

  return user;
}



export default {createUser};