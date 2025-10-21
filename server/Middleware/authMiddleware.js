import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const isAuthenticated = async (req, res, next) => {
  try {
    // Support both cookie and Authorization header tokens
    let token = req.cookies.token;
    
    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      return res.status(401).json({
        message: 'User not Authenticated',
        success: false,
      });
    }
    
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode || !decode.id) {
      return res.status(401).json({
        message: 'Invalid Token',
        success: false,
      });
    }
    
    // Verify user still exists in database
    const user = await User.findById(decode.id).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
        success: false,
      });
    }
    
    // COMMENT OUT EMAIL VERIFICATION CHECK
    // if (!user.isEmailVerified) {
    //   return res.status(401).json({
    //     message: 'Please verify your email first',
    //     success: false,
    //     requiresEmailVerification: true,
    //     email: user.email
    //   });
    // }
    
    // Add full user object to request for controllers to use
    req.user = {
      id: decode.id,
      email: user.email,
      name: user.name,
      isVerified: user.isEmailVerified // Keep for reference
    };
    
    next();
    
  } catch (error) {
    console.log('Authentication Error', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid Token',
        success: false,
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token Expired',
        success: false,
      });
    }
    
    return res.status(401).json({
      message: 'Authentication Error',
      success: false,
    });
  }
};

export default isAuthenticated;