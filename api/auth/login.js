// api/auth/login.js
import { connectToDatabase } from '../../utils/database';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Set CORS headers (same as above)
  // ...

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { db } = await connectToDatabase();
    
    // Find user by email
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare passwords
    const passwordMatch = await compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      requiresMfa: user.mfaEnabled || false
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}