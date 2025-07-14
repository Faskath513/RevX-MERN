const mongoose = require('mongoose');

const ProfilePictureSchema = new mongoose.Schema({
  data: Buffer,  // Store image as binary data
  contentType: String,  // Store file's MIME type
}, { _id: false }); // Prevents Mongoose from creating an extra _id field for subdocuments