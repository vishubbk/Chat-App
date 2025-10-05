import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name:{
    type:String,
    lowercase:true,
    required:true,
    unique:[true, 'Must be Unique name are Allowed'],
    trim:true
  },
  users:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ]
})

const Project = mongoose.model('project', projectSchema)

export default Project