import crypto from 'crypto';
import { query } from './db.js';

const SECRET = process.env.SESSION_SECRET || 'quizmaster-secret-key-12345';

// Session token generation using native crypto (no extra dependencies)
export function generateToken(user) {
  const payload = JSON.stringify({ id: user.id, email: user.email, role: user.role });
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

// Session token verification
export function verifyToken(token) {
  if (!token) return null;
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;
    const payloadText = Buffer.from(base64Payload, 'base64').toString('utf8');
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payloadText).digest('hex');
    if (signature === expectedSignature) {
      return JSON.parse(payloadText);
    }
  } catch (e) {}
  return null;
}

// PBKDF2 Password hashing helper
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, originalHash] = stored.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { action } = req.body;

    // --- SIGN UP ---
    if (action === 'signup') {
      const { email, password, name, role, adminPin } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      // Validate Admin passcode if registering as admin
      const isRegisteringAdmin = role === 'admin';
      if (isRegisteringAdmin) {
        const expectedPin = process.env.ADMIN_PIN || '1234';
        if (adminPin !== expectedPin) {
          return res.status(401).json({ error: 'Invalid Administrative PIN' });
        }
      }

      // Check if user already exists
      const existCheck = await query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
      if (existCheck.rows.length > 0) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const passHash = hashPassword(password);
      const insertRes = await query(
        `INSERT INTO users (email, password_hash, name, role, provider) 
         VALUES ($1, $2, $3, $4, 'local') RETURNING *`,
        [email.trim().toLowerCase(), passHash, name.trim(), isRegisteringAdmin ? 'admin' : 'user']
      );

      const user = insertRes.rows[0];
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }

    // --- SIGN IN / LOGIN ---
    if (action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userRes = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = userRes.rows[0];
      if (user.provider !== 'local') {
        return res.status(400).json({ error: `Please log in using your ${user.provider} provider` });
      }

      const isMatch = verifyPassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }

    // --- GOOGLE SIGN-IN SIMULATOR ---
    if (action === 'google') {
      const { email, name } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: 'Google email and name are required' });
      }

      // Check if user already exists
      const userCheck = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
      let user;

      if (userCheck.rows.length > 0) {
        user = userCheck.rows[0];
        // Auto-link or allow google signin if local, updating provider if it was empty/guest
        if (user.provider === 'guest') {
          await query('UPDATE users SET provider = $1, name = $2 WHERE id = $3', ['google', name.trim(), user.id]);
          user.provider = 'google';
          user.name = name.trim();
        }
      } else {
        // Create new google user
        const insertRes = await query(
          `INSERT INTO users (email, password_hash, name, role, provider) 
           VALUES ($1, NULL, $2, 'user', 'google') RETURNING *`,
          [email.trim().toLowerCase(), name.trim()]
        );
        user = insertRes.rows[0];
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }

    // --- CONTINUE AS GUEST ---
    if (action === 'guest') {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Guest nickname is required' });
      }

      const randomBytes = crypto.randomBytes(6).toString('hex');
      const guestEmail = `guest_${randomBytes}@guest.quiz`;

      const insertRes = await query(
        `INSERT INTO users (email, password_hash, name, role, provider) 
         VALUES ($1, NULL, $2, 'user', 'guest') RETURNING *`,
        [guestEmail, name.trim()]
      );

      const user = insertRes.rows[0];
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }

    // --- LEGACY PIN LOGIN COMPATIBILITY ---
    const { pin } = req.body;
    const adminPin = process.env.ADMIN_PIN || '1234';
    if (pin === adminPin) {
      // Return a signed admin token to keep it secure
      const legacyAdminUser = { id: 0, email: 'admin@legacy.quiz', role: 'admin' };
      const token = generateToken(legacyAdminUser);
      return res.status(200).json({ success: true, token });
    }

    return res.status(400).json({ error: 'Invalid authentication request' });

  } catch (error) {
    console.error('API Error in auth.js:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
