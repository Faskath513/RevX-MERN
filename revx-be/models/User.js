const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['employee', 'manager', 'hr'], 
  },
  profilePicture: {
    data: Buffer, 
    contentType: String 
},
  employeeDetails: {
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department',required:false },
    designation: { type: String },
    joiningDate: { type: Date },
  },
  managerDetails: {
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department',required:false },
  },
  hrDetails: {

   
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('User', UserSchema);