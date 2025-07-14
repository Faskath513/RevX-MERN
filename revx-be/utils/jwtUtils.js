const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// JWT secret key (from .env file)
const JWT_SECRET = process.env.JWT_SECRET;  // Ensure JWT_SECRET is set in your .env file

// Function to generate a JWT token
const generateToken = (user, expiresIn = '10h') => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  // Generate token with customizable expiration time
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

  return token;
};

// Function to verify a JWT token
const verifyToken = (token) => {
  try {
    // Verify the token and return the decoded data
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Token is not valid or expired');
  }
};

// Function to decode a JWT token without verifying (use cautiously)
const decodeToken = (token) => {
  try {
    // Decode the token to get the payload without verification
    const decoded = jwt.decode(token);
    return decoded;
  } catch (err) {
    throw new Error('Unable to decode the token');
  }
};

// Function to check if a token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);  // Use verify to also check validity
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    return currentTime > expirationTime;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return true;
    }
    throw new Error('Unable to check token expiration');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
};
