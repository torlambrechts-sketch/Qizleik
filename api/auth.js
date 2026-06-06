import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { pin } = req.body;
    const adminPin = process.env.ADMIN_PIN || '1234';

    if (pin === adminPin) {
      return res.status(200).json({ success: true, token: 'admin_authenticated_token' });
    } else {
      return res.status(401).json({ error: 'Invalid Admin PIN. Please try again.' });
    }
  } catch (error) {
    console.error('API Error in auth.js:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
