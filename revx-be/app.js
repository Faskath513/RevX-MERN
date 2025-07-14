// app.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const hrRoutes = require('./routes/hrRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const teamRoutes = require('./routes/teamRoutes');
const goalRoutes = require('./routes/goalRoutes');
const selfAssessmentRoutes = require('./routes/selfAssessmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const taskRoutes = require('./routes/taskRoutes');
const goalReviewRoutes = require('./routes/goalReviewRoutes');
const taskReviewRoutes = require('./routes/taskReviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', hrRoutes);
app.use('/api/update', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/self-assessments', selfAssessmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goalReviews', goalReviewRoutes);
app.use('/api/taskReviews', taskReviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Export app
module.exports = app;