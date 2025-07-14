// server.js
const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB again for safety
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected...');
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
.catch((err) => console.error('MongoDB connection error:', err));