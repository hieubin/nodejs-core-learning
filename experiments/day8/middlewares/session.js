import 'dotenv/config';
import session from 'express-session';

// MemoryStore is suitable for this lab only; use Redis or another shared store in production.
export default session({
  secret: process.env.SESSION_SECRET || 'day8-lab-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Production needs secure: true and HTTPS.
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60,
  },
});