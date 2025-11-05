/**
 * API Endpoint: /api/auth
 * Simple authentication for editors
 */

// Authorized users
const USERS = {
  'adolf': 'BMTADMIN',
  'chadi': 'BMTADMIN',
};

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check credentials
    if (USERS[username] && USERS[username] === password) {
      return res.status(200).json({
        success: true,
        username,
        message: 'Login successful',
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
    }
  } catch (error) {
    console.error('Error in /api/auth:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: error.message,
    });
  }
}
