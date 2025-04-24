// api/auth/register.js
import { connectToDatabase } from '../../utils/database';
import { hash } from 'bcryptjs';

export default async function handler(req, res) {
  // Set CORS headers (same as above)
  // ...

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const { db } = await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      mfaEnabled: false,
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    return res.status(201).json({
      success: true,
      user: {
        id: result.insertedId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}