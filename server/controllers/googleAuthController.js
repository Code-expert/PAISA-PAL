import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://paisa-pal.onrender.com' : 'http://localhost:5000')}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
      const displayName = profile.displayName || 
     `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: displayName,
        email: email,
        googleId: profile.id,
        photo: profile.photos[0]?.value,
        isEmailVerified: true,
      });
    } else {
      user.googleId = profile.id;
      user.name = displayName; 
      user.photo = profile.photos[0]?.value;
      user.isEmailVerified = true;
      await user.save();
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'select_account'
});

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    const isProd = process.env.NODE_ENV === 'production';
    const defaultFrontend = isProd ? 'https://paisa-pal-ten.vercel.app' : 'http://localhost:5173';
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || defaultFrontend;
    
    if (err) {
      return res.redirect(`${frontendUrl}/auth/login?error=auth_failed`);
    }
    
    if (!user) {
      return res.redirect(`${frontendUrl}/auth/login?error=no_user`);
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.redirect(`${frontendUrl}/auth/login?error=login_failed`);
      }
      
      const token = generateToken(user);
      const userData = encodeURIComponent(JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        isEmailVerified: true,
        googleId: user.googleId
      }));
      
      res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&user=${userData}`);
    });
  })(req, res, next);
};
